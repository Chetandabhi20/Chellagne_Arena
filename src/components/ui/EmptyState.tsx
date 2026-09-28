
export const EmptyState = ({ icon: Icon, message, action }: { icon: any, message: string, action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border border-border border-dashed rounded bg-panel-2/50">
    <Icon className="w-8 h-8 text-muted mb-4" />
    <p className="text-muted mb-4">{message}</p>
    {action}
  </div>
);
