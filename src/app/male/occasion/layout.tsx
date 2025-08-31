import BottomNavigation from '@/components/male/BottomNavigation';

export default function OccasionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1a1414]">
      {children}
      <BottomNavigation />
    </div>
  );
}
