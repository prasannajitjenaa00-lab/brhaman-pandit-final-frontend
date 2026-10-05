import toast from 'react-hot-toast';
import { errMsg } from './api';

/**
 * Runs an async API action with the app-wide UX: optional confirm dialog, success toast,
 * error toast, and an onDone callback (usually a list reload). Returns true on success.
 */
export async function runAction(fn, { confirm, success, onDone } = {}) {
  if (confirm && !window.confirm(confirm)) return false;
  try {
    const result = await fn();
    if (success) toast.success(typeof success === 'function' ? success(result) : success);
    if (onDone) await onDone(result);
    return true;
  } catch (e) {
    toast.error(errMsg(e));
    return false;
  }
}
