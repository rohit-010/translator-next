let translatedData = [];
const countWords = (input) => {
  return input.split(' ').length;
};

const callBackendApi = async (reqBody, counter) => {
  const response = await fetch(process.env.TRANSLATE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqBody),
  });

  if (response.status === 200) {
    const data = await response.json();
    console.log('Response in backedn', data);
    if (data.translated_text) {
      translatedData.push({ counter: counter, data: data.translated_text });
      return data.translated_text;
    }
  }
};

const postInChunks = async (
  input,
  wordCount,
  chunkCount,
  source_lang,
  target_lang
) => {
  const wordsArray = input.split(' ');
  console.log('wordsArray->', wordsArray);

  const chunks = [];
  const chunkText = [];

  for (let i = 0; i < wordCount; i += chunkCount) {
    const chunk = wordsArray.slice(i, i + chunkCount);
    chunks.push(chunk);
  }

  chunks.forEach((chunkArr) => {
    const textContent = chunkArr.join(' ');
    chunkText.push(textContent);
  });

  console.log('chunkText->', chunkText);

  let counter = 0;

  for (let text of chunkText) {
    await callBackendApi({ text, source_lang, target_lang }, counter);

    counter++;
  }
  console.log('translatedData:', translatedData);
  return translatedData;
};

export default async function handler(req, res) {
  try {
    //Setting global translated array to empty again for reset
    translatedData = [];
    let translatedArray;
    let translated_text = '';
    const reqData = req.body;
    console.log('text:', reqData.text);
    console.log('source_lang:', reqData.source_lang);
    console.log('target_lang:', reqData.target_lang);
    if (!reqData.text) {
      throw Error('Input not present in request for translation');
    }

    const totalWords = countWords(reqData.text);
    translatedArray = await postInChunks(
      reqData.text,
      totalWords,
      process.env.WORD_COUNT,
      reqData.source_lang,
      reqData.target_lang
    );
    console.log('translatedArray:::', translatedArray);
    if (translatedArray) {
      translatedArray.forEach((text) => {
        translated_text = translated_text + `${text.data}\n\n`;
      });
      console.log('translated_text:::', translated_text);
      res.status(200).send({ translated_text: translated_text });
    } else {
      res.status(500).send({ error: 'Error occurred in backend' });
    }
  } catch (err) {
    console.error('Error occurred in handler code, please check backend', err);
  }
}
