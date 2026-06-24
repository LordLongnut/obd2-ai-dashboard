type SymptomInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function SymptomInput({ value, onChange }: SymptomInputProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-3">Driver / Technician Notes</h3>

      <p className="text-slate-400 mb-3">
        Add symptoms so the AI can combine scan data with real-world behavior.
      </p>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: Rough idle when warm, slight hesitation on acceleration, check engine light flashing under load..."
        className="w-full min-h-28 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
    </div>
  );
}

export default SymptomInput;
