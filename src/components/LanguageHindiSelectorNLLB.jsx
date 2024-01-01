const LANGUAGES = {
  English: 'eng_Latn',
  Hindi: 'hin_Deva',
};

export default function LanguageHindiSelectorNLLB({
  type,
  onChange,
  defaultLanguage,
}) {
  return (
    <div className="language-selector">
      <label>{type}: </label>
      <select onChange={onChange} defaultValue={defaultLanguage}>
        {Object.entries(LANGUAGES).map(([key, value]) => {
          return (
            <option key={key} value={value}>
              {key}
            </option>
          );
        })}
      </select>
    </div>
  );
}
