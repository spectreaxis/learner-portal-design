import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import mpesaService from '../services/mpesa.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

const CERTIFICATE_PRICE = parseFloat(process.env.CERTIFICATE_PRICE || '646.80');

/**
 * POST /api/payment/initiate
 * Initiate certificate payment via M-Pesa STK Push
 */
router.post('/initiate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId, phoneNumber } = req.body;
    const learnerId = req.userId;

    // Validation
    if (!certificateId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID and phone number are required',
      });
    }

    // Check if certificate exists
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { learner: true, module: true },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Verify certificate belongs to the requesting learner
    if (certificate.learnerId !== learnerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this certificate',
      });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { certificateId },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Certificate already paid for',
      });
    }

    // Initiate STK Push
    const stkResponse = await mpesaService.initiateSTKPush({
      phoneNumber,
      amount: CERTIFICATE_PRICE,
      accountReference: certificate.certificateId,
      transactionDesc: `Certificate - ${certificate.module.title}`,
    });

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { certificateId },
      create: {
        learnerId,
        certificateId,
        amount: CERTIFICATE_PRICE,
        phoneNumber,
        merchantRequestId: stkResponse.MerchantRequestID,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        status: 'PENDING',
        metadata: {
          moduleName: certificate.module.title,
          initiatedAt: new Date().toISOString(),
        },
      },
      update: {
        phoneNumber,
        merchantRequestId: stkResponse.MerchantRequestID,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'STK Push initiated. Please enter your M-Pesa PIN on your phone.',
      data: {
        paymentId: payment.id,
        checkoutRequestId: payment.checkoutRequestId,
        amount: CERTIFICATE_PRICE,
        customerMessage: stkResponse.CustomerMessage,
      },
    });
  } catch (error: any) {
    console.error('❌ Payment initiation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
    });
  }
});

/**
 * Parse M-Pesa date format (YYYYMMDDHHmmss) to JavaScript Date
 */
function parseMpesaDate(dateString: string | number): Date | undefined {
  if (!dateString) return undefined;

  const str = String(dateString);
  if (str.length !== 14) return undefined;

  const year = str.substring(0, 4);
  const month = str.substring(4, 6);
  const day = str.substring(6, 8);
  const hour = str.substring(8, 10);
  const minute = str.substring(10, 12);
  const second = str.substring(12, 14);

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
}

/**
 * POST /api/payment/callback
 * M-Pesa callback handler (receives payment confirmation)
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    console.log('📥 M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      console.log('⚠️ Invalid callback format');
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
    });

    if (!payment) {
      console.log('⚠️ Payment not found for CheckoutRequestID:', CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    // ResultCode 0 = Success, anything else = failure
    if (ResultCode === 0) {
      // Extract payment details from callback metadata
      const metadata = CallbackMetadata?.Item || [];
      const mpesaReceipt = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;

      // Update payment as COMPLETED
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNumber: mpesaReceipt,
          transactionDate: parseMpesaDate(transactionDate),
          resultCode: String(ResultCode),
          resultDesc: ResultDesc,
          metadata: {
            ...(payment.metadata as any),
            callbackReceivedAt: new Date().toISOString(),
            mpesaReceipt,
            phoneNumber,
            amount,
          },
        },
      });

      console.log('✅ Payment completed successfully:', mpesaReceipt);
    } else {
      // Payment failed or cancelled
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: ResultCode === 1032 ? 'CANCELLED' : 'FAILED',
          resultCode: String(ResultCode),
          resultDesc: ResultDesc,
          metadata: {
            ...(payment.metadata as any),
            callbackReceivedAt: new Date().toISOString(),
          },
        },
      });

      console.log(`❌ Payment failed: ${ResultDesc} (Code: ${ResultCode})`);
    }

    // Acknowledge callback
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error: any) {
    console.error('❌ Callback processing error:', error);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  }
});

/**
 * GET /api/payment/status/:checkoutRequestId
 * Check payment status
 */
router.get('/status/:checkoutRequestId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { checkoutRequestId } = req.params;
    const learnerId = req.userId;

    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId },
      include: {
        certificate: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Verify payment belongs to the requesting learner
    if (payment.learnerId !== learnerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // If still pending after 60 seconds, query M-Pesa API for status
    const ageInSeconds = (Date.now() - payment.createdAt.getTime()) / 1000;
    if (payment.status === 'PENDING' && ageInSeconds > 60) {
      try {
        const stkStatus = await mpesaService.querySTKPushStatus(checkoutRequestId);

        if (stkStatus.ResultCode === '0') {
          // Payment was successful but callback might have failed
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED', resultCode: '0', resultDesc: 'Success' },
          });
          payment.status = 'COMPLETED';
        }
      } catch (error) {
        console.error('Error querying STK status:', error);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        mpesaReceipt: payment.mpesaReceiptNumber,
        transactionDate: payment.transactionDate,
        certificate: {
          id: payment.certificate.id,
          certificateId: payment.certificate.certificateId,
          moduleName: payment.certificate.module.title,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
    });
  }
});

/**
 * GET /api/payment/certificate/:certificateId
 * Check if certificate is paid for
 */
router.get('/certificate/:certificateId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;
    const learnerId = req.userId;

    const payment = await prisma.payment.findUnique({
      where: { certificateId },
    });

    if (!payment) {
      return res.status(200).json({
        success: true,
        data: { isPaid: false },
      });
    }

    // Verify payment belongs to the requesting learner
    if (payment.learnerId !== learnerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        isPaid: payment.status === 'COMPLETED',
        status: payment.status,
        amount: payment.amount,
        mpesaReceipt: payment.mpesaReceiptNumber,
      },
    });
  } catch (error: any) {
    console.error('❌ Certificate payment check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
    });
  }
});

export default router;
