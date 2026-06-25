'use client';

export function AccountSpecTable({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <table className="w-full border-collapse text-left">
        <tbody>{children}</tbody>
      </table>
    </section>
  );
}

export function SpecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <tr className="border-b border-border-primary bg-surface-image-background">
        <th
          colSpan={4}
          className="px-4 py-2 text-left text-xs font-bold uppercase tracking-[0.08em] text-text-headings"
        >
          {title}
        </th>
      </tr>
      {children}
    </>
  );
}

function SpecPair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <td className="w-[18%] border-b border-border-primary px-4 py-2.5 align-top text-sm font-medium text-text-placeholders">
        {label}
      </td>
      <td className="w-[32%] border-b border-border-primary px-4 py-2.5 align-top text-sm text-text-body">{value}</td>
    </>
  );
}

export function SpecRow({
  left,
  right,
}: {
  left: { label: string; value: React.ReactNode };
  right?: { label: string; value: React.ReactNode };
}) {
  return (
    <tr>
      <SpecPair label={left.label} value={left.value} />
      {right ? (
        <SpecPair label={right.label} value={right.value} />
      ) : (
        <>
          <td className="border-b border-border-primary" />
          <td className="border-b border-border-primary" />
        </>
      )}
    </tr>
  );
}

export function SpecFullWidthRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="w-[18%] border-b border-border-primary px-4 py-2.5 align-top text-sm font-medium text-text-placeholders">
        {label}
      </td>
      <td colSpan={3} className="border-b border-border-primary px-4 py-2.5 align-top text-sm text-text-body">
        {children}
      </td>
    </tr>
  );
}

export function SpecNoteRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <tr className="border-b border-border-primary bg-surface-image-background">
        <th
          colSpan={4}
          className="px-4 py-2 text-left text-xs font-bold uppercase tracking-[0.08em] text-text-headings"
        >
          {title}
        </th>
      </tr>
      <tr>
        <td colSpan={4} className="px-4 py-3 text-sm text-text-body leading-relaxed whitespace-pre-wrap">
          {children}
        </td>
      </tr>
    </>
  );
}
