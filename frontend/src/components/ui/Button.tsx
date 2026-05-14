import type { ButtonHTMLAttributes, ReactElement } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  danger: 'btn btn--danger',
  ghost: 'btn btn--ghost',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant | undefined;
  readonly loading?: boolean | undefined;
}

export function Button({
  variant = 'primary',
  loading = false,
  type = 'button',
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps): ReactElement {
  const cls = `${variantClass[variant]} ${className}`.trim();
  return (
    <button type={type} className={cls} disabled={disabled === true || loading} {...rest}>
      {loading ? '…' : children}
    </button>
  );
}
