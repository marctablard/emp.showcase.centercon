'use client';

import { useEffect, useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Check, CircleAlert, Dot } from 'lucide-react';

interface PasswordCriteriaProps {
  control: any;
  passwordField: string;
}

type CriteriaState = {
  minLength: boolean | null;
  uppercase: boolean | null;
  lowercase: boolean | null;
  number: boolean | null;
};

export function PasswordCriteria({ control, passwordField }: PasswordCriteriaProps) {
  const t = useTranslations('auth.register.passwordCriteria');
  const password = useWatch({
    control,
    name: passwordField,
  });

  const { touchedFields, dirtyFields } = useFormState({ control });

  const [criteria, setCriteria] = useState<CriteriaState>({
    minLength: null,
    uppercase: null,
    lowercase: null,
    number: null,
  });

  const isFieldTouched = touchedFields[passwordField];
  const isFieldDirty = dirtyFields[passwordField];

  useEffect(() => {
    if (password) {
      setCriteria({
        minLength: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
      });
    } else if (isFieldTouched || isFieldDirty) {
      setCriteria({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
      });
    } else {
      setCriteria({
        minLength: null,
        uppercase: null,
        lowercase: null,
        number: null,
      });
    }
  }, [password, isFieldTouched, isFieldDirty]);

  return (
    <ul className="space-y-2 text-sm">
      <li className="flex items-center gap-1">
        {criteria.minLength === null ? (
          <Dot className="h-4 w-4" />
        ) : criteria.minLength ? (
          <Check className="h-4 w-4 text-success-500" />
        ) : (
          <CircleAlert className="h-4 w-4 text-danger-500" />
        )}
        <span
          className={criteria.minLength === null ? '' : criteria.minLength ? 'text-success-500' : 'text-danger-500'}
        >
          {t('minLength')}
        </span>
      </li>
      <li className="flex items-center gap-1">
        {criteria.uppercase === null ? (
          <Dot className="h-4 w-4" />
        ) : criteria.uppercase ? (
          <Check className="h-4 w-4 text-success-500" />
        ) : (
          <CircleAlert className="h-4 w-4 text-danger-500" />
        )}
        <span
          className={criteria.uppercase === null ? '' : criteria.uppercase ? 'text-success-500' : 'text-danger-500'}
        >
          {t('uppercase')}
        </span>
      </li>
      <li className="flex items-center gap-1">
        {criteria.lowercase === null ? (
          <Dot className="h-4 w-4" />
        ) : criteria.lowercase ? (
          <Check className="h-4 w-4 text-success-500" />
        ) : (
          <CircleAlert className="h-4 w-4 text-danger-500" />
        )}
        <span
          className={criteria.lowercase === null ? '' : criteria.lowercase ? 'text-success-500' : 'text-danger-500'}
        >
          {t('lowercase')}
        </span>
      </li>
      <li className="flex items-center gap-1">
        {criteria.number === null ? (
          <Dot className="h-4 w-4" />
        ) : criteria.number ? (
          <Check className="h-4 w-4 text-success-500" />
        ) : (
          <CircleAlert className="h-4 w-4 text-danger-500" />
        )}
        <span className={criteria.number === null ? '' : criteria.number ? 'text-success-500' : 'text-danger-500'}>
          {t('number')}
        </span>
      </li>
    </ul>
  );
}
