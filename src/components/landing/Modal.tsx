"use client";

import { useState, type ComponentProps, type FormEvent } from "react";
import { ArrowRight, CircleCheck, X } from "lucide-react";

const ID = "modal-early";
const dialog = () => document.getElementById(ID) as HTMLDialogElement;

/** Opens the early access <Modal>; usable from server components. */
export function ModalButton(props: ComponentProps<"button">) {
  return <button type="button" aria-haspopup="dialog" onClick={() => dialog().showModal()} {...props} />;
}

const field = "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-small outline-accent";

/** Early access dialog. Native <dialog>: focus trap, Escape and inert page come free. */
export function Modal() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <dialog
      id={ID}
      aria-labelledby={`${ID}-title`}
      onClose={() => setSent(false)}
      // The content fills the dialog, so a click on the element itself is a backdrop click.
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="m-auto w-[min(100%-2.5rem,510px)] rounded-[20px] border border-border bg-surface text-primary shadow-[0_24px_80px_rgba(11,33,23,.23)] open:animate-rise-in backdrop:bg-primary/50 backdrop:backdrop-blur-[5px] open:backdrop:animate-fade-in"
    >
      <div className="relative p-6 md:p-9">
        <form method="dialog">
          <button className="icon-btn absolute top-4 right-4" aria-label="Close dialog"><X className="size-[18px]" /></button>
        </form>
        <h2 id={`${ID}-title`} className="mb-2 font-editorial text-[25px] tracking-[-.04em] md:text-[28px]">A clearer way to shop.</h2>
        <p className="mb-5 max-w-[390px] text-small text-secondary">Join the early access list and be first to try Opsvo.</p>

        {sent ? (
          <div role="status" className="grid gap-2 rounded-lg border border-border bg-subtle p-4 text-label">
            <p className="flex items-center gap-2 font-bold text-success"><CircleCheck className="size-5" /> You’re on the list</p>
            <span className="text-secondary">We’ll be in touch when Opsvo is ready for you.</span>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="access-email" className="mb-2 block text-2xs font-bold">Email address</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="access-email" type="email" required autoFocus placeholder="you@example.com" className={`${field} flex-1`} />
              <button className="btn btn-primary self-start sm:self-auto">Join the list <ArrowRight className="size-4" /></button>
            </div>
            <small className="mt-2 block text-2xs text-secondary">No noise. Just a note when Opsvo is ready.</small>
          </form>
        )}
      </div>
    </dialog>
  );
}
