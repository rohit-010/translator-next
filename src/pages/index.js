import { useEffect, useRef, useState } from 'react';
import LanguageSelector from '../components/LanguageSelector';
import Progress from '../components/Progress';
import Str from '@supercharge/strings';

const globalArray = [];
let globalChunkCounter = 0;

function compareData(a, b) {
  return a.translation_order - b.translation_order;
}

function App() {
  // Reference to worker object
  const worker = useRef(null);

  // Model loading
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);

  // Inputs and outputs
  const [input, setInput] = useState('I love walking my dog.');
  const [sourceLanguage, setSourceLanguage] = useState('eng_Latn');
  const [targetLanguage, setTargetLanguage] = useState('fra_Latn');
  const [output, setOutput] = useState('');
  const [chunkCounter, setChunkCounter] = useState(0);
  const [totalChunk, setTotalChunk] = useState(0);
  const [inputWordCount, setInputWordCount] = useState();

  const [chunkOutput, setChunkOutput] = useState([]);

  //useEffect hook to setup the worker as soon as the App component is mounted
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('../../worker.js', import.meta.url), {
        type: 'module',
      });
    }

    // Callback fn for messages from the worker thread
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems((prev) => [...prev, e.data]);
          break;

        case 'progress':
          // Model file progress: update one of the progress items.
          setProgressItems((prev) =>
            prev.map((item) => {
              if (item.file === e.data.file) {
                return { ...item, progress: e.data.progress };
              }
              return item;
            })
          );
          break;

        case 'done':
          // Model file loaded: remove the progress item from the list.
          setProgressItems((prev) =>
            prev.filter((item) => item.file !== e.data.file)
          );
          break;

        case 'ready':
          // Pipeline ready: the worker is ready to accept messages.
          setReady(true);
          break;

        case 'update':
          // Generation update: update the output text.

          setOutput(e.data.output);

          break;

        case 'complete':
          // Generation complete: re-enable the "Translate" button
          console.log('On complete output:', e.data.output[0].translation_text);
          console.log('On complete input:', e.data.input);

          globalArray.push({
            translation_order: e.data.order,
            translation_text: e.data.output[0].translation_text,
          });

          console.log('globalChunkCounter -->', globalChunkCounter);
          console.log('totalChunk -->', totalChunk);
          globalChunkCounter++;
          console.log('globalChunkCounter incremented -->', globalChunkCounter);
          if (globalChunkCounter >= totalChunk) {
            const latestArray = globalArray.sort(compareData);
            console.log('latestArray -->', latestArray);
            const finalArray = latestArray.map((data) => data.translation_text);
            setOutput(finalArray.join('\n\n'));
            globalArray.length = 0;
            globalChunkCounter = 0;
            setDisabled(false);
          }

          break;
      }
    };

    // Attach the callback fn as an event listener
    worker.current.addEventListener('message', onMessageReceived);

    // Clean up fn for when component is unmounted
    return () =>
      worker.current.removeEventListener('message', onMessageReceived);
  });

  // const countWords = (input) => {
  //   return Str(input).words().length;
  // };

  const countWords = (input) => {
    setInputWordCount(input.split(' ').length);
    return input.split(' ').length;
  };

  const postInChunks = (input, wordCount, chunkCount) => {
    // const wordsArray = Str(input).words();
    const wordsArray = input.split(' ');
    console.log('wordsArray->', wordsArray);

    const chunks = [];

    for (let i = 0; i < wordCount; i += chunkCount) {
      const chunk = wordsArray.slice(i, i + chunkCount);
      chunks.push(chunk);
    }
    const chunkText = [];
    chunks.forEach((chunkArr) => {
      const textContent = chunkArr.join(' ');
      chunkText.push(textContent);
    });
    console.log('chunkText->', chunkText);

    setTotalChunk(chunkText.length);
    let counter = 0;
    for (let para of chunkText) {
      worker.current.postMessage({
        text: para,
        order: counter,
        src_lang: sourceLanguage,
        tgt_lang: targetLanguage,
      });
      counter++;
      // setTimeout(() => {
      //   console.log('PARA:', para);

      // }, 15000);
    }
  };

  const translate = () => {
    setDisabled(true);
    const wordCount = countWords(input);
    console.log('Word count is :', wordCount);
    postInChunks(input, wordCount, process.env.WORD_COUNT);
    // if (wordCount > process.env.WORD_COUNT) {

    // } else {
    //   worker.current.postMessage({
    //     text: input,
    //     src_lang: sourceLanguage,
    //     tgt_lang: targetLanguage,
    //   });
    // }
  };

  const refresh = () => {
    setInput('');
    setOutput('');
    setInputWordCount();
  };

  return (
    <>
      <h1>Translation App</h1>
      <h2>
        Machine Learning-powered multilingual translation in Next framework!
      </h2>
      {inputWordCount && (
        <h4>
          <i>
            Input word count is: <span>{inputWordCount}</span>
          </i>
        </h4>
      )}

      <div className="container">
        <div className="language-container">
          <LanguageSelector
            type={'Source'}
            defaultLanguage={'eng_Latn'}
            onChange={(x) => setSourceLanguage(x.target.value)}
          />
          <LanguageSelector
            type={'Target'}
            defaultLanguage={'fra_Latn'}
            onChange={(x) => setTargetLanguage(x.target.value)}
          />
        </div>

        <div className="textbox-container">
          <textarea
            value={input}
            rows={3}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <textarea value={output} rows={3} readOnly></textarea>
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

      <div className="progress-bars-container">
        {ready === false && <label>Loading models... (only run once)</label>}
        {progressItems.map((data) => (
          <div key={data.file}>
            <Progress text={data.file} percentage={data.progress} />
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
