interface FormInputProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FormInput({ label, children, className = "" }: FormInputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}
