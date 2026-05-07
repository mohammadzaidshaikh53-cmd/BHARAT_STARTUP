const GRADIENTS = {
  default: "radial-gradient(ellipse at 10% 10%, rgba(255,153,51,0.025) 0%, transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(0,60,160,0.025) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.012) 0%, transparent 60%)",
  verified: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.04) 0%, transparent 50%), radial-gradient(ellipse at 15% 80%, rgba(0,0,100,0.03) 0%, transparent 50%), radial-gradient(ellipse at 85% 60%, rgba(255,153,51,0.015) 0%, transparent 50%)",
  industries: "radial-gradient(ellipse at 20% 20%, rgba(0,60,160,0.025) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(255,153,51,0.02) 0%, transparent 50%)",
  sector: "radial-gradient(ellipse at 30% 30%, rgba(0,60,160,0.02) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(16,185,129,0.015) 0%, transparent 50%)",
};

export function PageBackground({ variant = "default" }) {
  return <div className="absolute inset-0 pointer-events-none" style={{ background: GRADIENTS[variant] }} />;
}