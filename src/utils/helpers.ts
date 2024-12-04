import { TrackedData } from '../tracking/trackedData.domain';
import { TrackedDataDto } from '../tracking/trackedData.dto';

export const throwCompileTimeErrorIfSwitchCaseNotImplemented = (
  _: never,
): never => _;

export const asTrackedData = (data: unknown): TrackedData => ({
  count: (data as TrackedDataDto).count,
  rawJson: Buffer.from(JSON.stringify(data as unknown)),
});

const oneSec = 1000;
const tenSecs = 10 * oneSec;
export const waitFor = async (
  callback: () => Promise<boolean>,
  timeout = tenSecs,
): Promise<boolean> => {
  if (await callback()) return true;

  if (timeout <= 0) return false;

  // wait for 1 sec
  await new Promise((resolve) => setTimeout(() => resolve(true), oneSec));

  return waitFor(callback, timeout - oneSec);
};
