import type { InputHTMLAttributes, ReactElement } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly id: string;
}

export function Input({ label, id, className = '', ...rest }: InputProps): ReactElement {
  return (
    <div className={`field ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input className="field__input" id={id} {...rest} />
    </div>
  );
}
