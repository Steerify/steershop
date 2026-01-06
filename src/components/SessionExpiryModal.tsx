import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { Clock } from 'lucide-react';

export const SessionExpiryModal = () => {
  const { isWarningShown, extendSession, timeRemaining } = useInactivityTimeout();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isWarningShown) {
      setCountdown(60);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil(timeRemaining / 1000);
      setCountdown(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [isWarningShown, timeRemaining]);

  if (!isWarningShown) return null;

  return (
    <AlertDialog open={isWarningShown}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <AlertDialogTitle className="text-xl">Session Expiring Soon</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4 text-base">
            Your session will expire in{' '}
            <span className="font-bold text-foreground">{countdown} seconds</span> due to inactivity.
            <br />
            <br />
            Any unsaved work will be preserved, but you'll need to log in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction
            onClick={extendSession}
            className="w-full sm:w-auto"
          >
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
