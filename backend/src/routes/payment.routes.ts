import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { ProviderFactory } from '../config/providers.config';
import { PaymentService } from '../application/services/PaymentService';
import { PaymentRepository } from '../infrastructure/database/repositories/PaymentRepository';
import { CertificateRepository } from '../infrastructure/database/repositories/CertificateRepository';
import { LearnerRepository } from '../infrastructure/database/repositories/LearnerRepository';
import { AppError } from '../core/errors/AppError';

const router = express.Router();

const dataProvider = ProviderFactory.getDataProvider();
const paymentService = new PaymentService(
  new PaymentRepository(dataProvider),
  new CertificateRepository(dataProvider),
  new LearnerRepository(dataProvider),
  (name) => ProviderFactory.getPaymentProvider(name)
);

function sendError(res: Response, error: any, fallback: string) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(`${fallback}:`, error.message);
  res.status(500).json({ error: fallback });
}

router.use(authenticate);

// Price and paid status of a certificate (reconciles unfinished payments)
router.get('/certificates/:certificateId', async (req: AuthRequest, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await paymentService.getCertificatePayment(req.userId!, req.params.certificateId as string));
  } catch (error: any) {
    sendError(res, error, 'Failed to load payment details');
  }
});

// Start (or resume) paying for a certificate; the amount is always set here
router.post('/certificates/:certificateId', async (req: AuthRequest, res) => {
  try {
    res.json(await paymentService.startCertificatePayment(req.userId!, req.params.certificateId as string));
  } catch (error: any) {
    sendError(res, error, 'Failed to start payment');
  }
});

router.get('/:reference', async (req: AuthRequest, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await paymentService.getPaymentStatus(req.userId!, req.params.reference as string));
  } catch (error: any) {
    sendError(res, error, 'Failed to check payment status');
  }
});

// Provider webhooks need the raw body for signature checks, so this router is
// mounted before the JSON body parser and the rate limiter
const webhookRouter = express.Router();

webhookRouter.post('/:provider', express.raw({ type: '*/*', limit: '100kb' }), async (req, res) => {
  try {
    // The body is absent (not a Buffer) when a request carries none
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    await paymentService.handleWebhook(req.params.provider as string, rawBody, req.headers);
    res.sendStatus(200);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    // Anything else is ours to fix; a non-2xx makes the provider retry later
    console.error('Webhook processing failed:', error.message);
    res.sendStatus(500);
  }
});

export { webhookRouter };
export default router;
