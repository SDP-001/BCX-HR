const questions = [
  { question: "What is ByteCodX?", answer: "ByteCodX is a connected people-operations platform for employee lifecycle workflows, attendance, leave, hiring, projects, and workforce reporting." },
  { question: "Can teams use only the modules they need?", answer: "The workspace uses role-based access, so teams see the modules and actions that match their responsibilities." },
  { question: "How is employee information protected?", answer: "The platform uses signed HTTP-only sessions, server-side permission checks, password hashing, and audit records for key administrative actions." },
  { question: "How can I learn more or request a walkthrough?", answer: "Send a note through the contact page and the ByteCodX team can follow up about your organization’s needs." },
];

export function FaqAccordion() {
  return (
    <div className="space-y-3">
      {questions.map(({ question, answer }) => (
        <details key={question} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">{question}<span className="text-xl text-cyan-200 transition group-open:rotate-45">+</span></summary>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">{answer}</p>
        </details>
      ))}
    </div>
  );
}
