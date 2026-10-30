// @paystack/inline-js ships no types; this covers the part the app uses
declare module '@paystack/inline-js' {
  interface ResumeCallbacks {
    onLoad?: (transaction: { id: number; accessCode: string }) => void;
    onSuccess?: (transaction: { id: number; reference: string; message: string }) => void;
    onCancel?: () => void;
    onError?: (error: { message: string }) => void;
  }

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: ResumeCallbacks): unknown;
  }
}
