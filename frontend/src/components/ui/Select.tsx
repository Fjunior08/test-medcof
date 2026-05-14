import type { ReactElement, SelectHTMLAttributes } from 'react';

export interface SelectOption<T extends string> {
  readonly value: T | '';
  readonly label: string;
}

export interface SelectProps<T extends string> extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly id: string;
  readonly options: readonly SelectOption<T>[];
}

export function Select<T extends string>({
  label,
  id,
  options,
  className = '',
  ...rest
}: SelectProps<T>): ReactElement {
  return (
    <div className={`field ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <select className="field__input" id={id} {...rest}>
        {options.map((opt) => (
          <option key={opt.value === '' ? '__empty' : opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
