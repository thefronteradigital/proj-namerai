interface FormInputProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FormInput({ label, children, className = "" }: FormInputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}
