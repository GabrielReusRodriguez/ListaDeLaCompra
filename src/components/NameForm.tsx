import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface NameFormProps {
  label: string;
  initialValue?: string;
  submitLabel?: string;
  onSubmit: (name: string) => void;
  onCancel?: () => void;
}

/** Formulario de un único campo de texto, usado para crear y renombrar listas. */
export function NameForm({
  label,
  initialValue = '',
  submitLabel,
  onSubmit,
  onCancel,
}: NameFormProps) {
  const { t } = useTranslation();
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) {
      setError(true);
      return;
    }
    setError(false);
    onSubmit(value.trim());
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          required
        />
        {error && (
          <p id={`${id}-error`} className="form__error" role="alert">
            {t.common.required}
          </p>
        )}
      </div>
      <div className="form__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {t.common.cancel}
          </button>
        )}
        <button type="submit" className="btn btn--primary">
          {submitLabel ?? t.common.save}
        </button>
      </div>
    </form>
  );
}
