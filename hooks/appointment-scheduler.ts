import useVapiFactory from './use-vapi-factory';

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
const assistantId =
  process.env.NEXT_PUBLIC_VAPI_SCHEDULER ||
  process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ||
  "";

const useBookAppointment = useVapiFactory(publicKey, assistantId);
export default useBookAppointment;
