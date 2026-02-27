import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Confetti from "react-dom-confetti";

const MILESTONES = [1, 10, 20, 30, 40, 50, 100, 200, 500, 1000];
const STORAGE_KEY = "steersolo_milestone_celebrated";

const confettiConfig = {
  angle: 90,
  spread: 120,
  startVelocity: 35,
  elementCount: 80,
  dragFriction: 0.11,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  colors: ["#f97316", "#22c55e", "#3b82f6", "#eab308", "#ec4899"],
};

interface SalesMilestonePopupProps {
  totalSales: number;
}

export const SalesMilestonePopup = ({ totalSales }: SalesMilestonePopupProps) => {
  const [milestone, setMilestone] = useState<number | null>(null);
  const [fire, setFire] = useState(false);

  useEffect(() => {
    if (!totalSales) return;
    const celebrated = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];

    for (const m of MILESTONES) {
      if (totalSales >= m && !celebrated.includes(m)) {
        setMilestone(m);
        setTimeout(() => setFire(true), 300);
        break;
      }
    }
  }, [totalSales]);

  const close = () => {
    if (milestone) {
      const celebrated = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as number[];
      celebrated.push(milestone);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(celebrated));
    }
    setMilestone(null);
    setFire(false);
  };

  const getMessage = (m: number) => {
    if (m === 1) return "You just made your first sale! 🎊 This is just the beginning!";
    return `Incredible! You've reached ${m} sales! 🎊 Keep up the amazing work!`;
  };

  return (
    <Dialog open={!!milestone} onOpenChange={(open) => !open && close()}>
      <DialogContent className="text-center max-w-sm">
        <div className="flex justify-center">
          <Confetti active={fire} config={confettiConfig} />
        </div>
        <DialogHeader>
          <DialogTitle className="text-2xl">🏆 Sales Milestone!</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {milestone && getMessage(milestone)}
          </DialogDescription>
        </DialogHeader>
        <div className="text-5xl font-bold text-primary my-4">{milestone}</div>
        <p className="text-sm text-muted-foreground mb-2">
          {milestone === 1 ? "sale completed" : "sales completed"}
        </p>
        <Button onClick={close} className="w-full">
          Keep Selling! 🚀
        </Button>
      </DialogContent>
    </Dialog>
  );
};
