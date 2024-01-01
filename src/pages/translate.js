import { useEffect, useRef, useState } from 'react';
import LanguageSelectorAll from '../components/LanguageSelectorAll';

function App() {
  const [disabled, setDisabled] = useState(false);
  // Inputs and outputs
  const [input, setInput] = useState('I love walking my dog.');
  const [sourceLanguage, setSourceLanguage] = useState('eng_Latn');
  const [targetLanguage, setTargetLanguage] = useState('mar_Deva');
  const [output, setOutput] = useState('');
  const [inputWordCount, setInputWordCount] = useState();
  const [error, setError] = useState('');

  const countWords = (input) => {
    setInputWordCount(input.split(' ').length);
    return input.split(' ').length;
  };

  const translate_via_api = async (input) => {
    console.log('translate_via_api');
    console.log('input', input);
    console.log('sourceLanguage', sourceLanguage);
    console.log('targetLanguage', targetLanguage);
    const reqBody = {
      text: input,
      source_lang: sourceLanguage,
      target_lang: targetLanguage,
    };
    const response = await fetch('/api/translate', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });

    const data = await response.json();
    console.log('response data', data);
    if (data.translated_text) {
      setOutput(data.translated_text);
    } else {
      setError('Error occurred in backend , please check backend details');
    }
    setDisabled(false);
  };

  const translate = async () => {
    setOutput('');
    setDisabled(true);
    countWords(input);
    await translate_via_api(input);
  };

  const refresh = () => {
    console.log('Should refresh and remove previous state');
    setInput('');
    setOutput('');
    setInputWordCount();
  };

  return (
    <>
      <div className="translation-header">
        <h1>Translation App</h1>
      </div>
      <h2>Machine Learning-powered translation in Next framework!</h2>
      {inputWordCount && (
        <h4>
          <i>
            Input word count is: <span>{inputWordCount}</span>
          </i>
        </h4>
      )}

      <div className="container">
        <div className="language-container">
          <LanguageSelectorAll
            type={'Source'}
            defaultLanguage={'eng_Latn'}
            onChange={(x) => setSourceLanguage(x.target.value)}
          />
          <LanguageSelectorAll
            type={'Target'}
            defaultLanguage={'mar_Deva'}
            onChange={(x) => setTargetLanguage(x.target.value)}
          />
        </div>

        <div className="textbox-container">
          <textarea
            value={input}
            rows={5}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <textarea value={output} rows={5} readOnly></textarea>
        </div>
      </div>
      <div className="btn-container">
        <button disabled={disabled} onClick={translate}>
          Translate
        </button>

        <button disabled={disabled} onClick={refresh}>
          Refresh
        </button>
      </div>
    </>
  );
}

export default App;
