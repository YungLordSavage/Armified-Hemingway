<script>
  window.addEventListener('load', function () {
    (function () {
      let form = document.getElementById("bullet-app");
      // Ensure the form is found
      if (!form) {
        console.error("Could not find the form element.");
        return;
      }
      let inputArea = form.querySelector("textarea#text-area");
      let outputArea = form.querySelector("#output");
      let feedbackArea = form.querySelector("#feedback");
      let clearButton = form.querySelector("#clear-button");
      let copyButton = form.querySelector("#copy-button");

      if (!inputArea || !feedbackArea || !clearButton || !copyButton) {
        console.error("Could not find one or more required elements inside the form.");
        return;
      }

      let data = {
        paragraphs: 0,
        sentences: 0,
        words: 0,
        adverbs: 0,
        qualitative: 0,
        quantitative: 0,
        characterCount: 0,
        pronouns: 0
      };

      const adverbsEndpoint = "https://xezm-wcsq-pv5u.n7.xano.io/api:OLWN1h-k/adverbs";
      const pronounsEndpoint = "https://xezm-wcsq-pv5u.n7.xano.io/api:OLWN1h-k/pronouns";
      const qualitativeEndpoint = "https://xezm-wcsq-pv5u.n7.xano.io/api:OLWN1h-k/qualitative_terms";

      async function fetchAdverbs() {
        try {
          const response = await fetch(adverbsEndpoint);

          if (!response.ok) {
            throw new Error(`Adverbs API request failed with status: ${response.status}`);
          }

          const data = await response.json();
          const adverbs = data.map(item => item.adverbs.trim().toLowerCase());
          return adverbs;
        } catch (error) {
          console.error("Error fetching adverbs:", error.message);
          return [];
        }
      }

      async function fetchPronouns() {
        try {
          const response = await fetch(pronounsEndpoint);

          if (!response.ok) {
            throw new Error(`Pronouns API request failed with status: ${response.status}`);
          }

          const data = await response.json();
          const pronouns = data.map(item => item.pronouns.trim().toLowerCase());
          return pronouns;
        } catch (error) {
          console.error("Error fetching pronouns:", error.message);
          return [];
        }
      }

      async function fetchQualitativeTerms() {
        try {
          const response = await fetch(qualitativeEndpoint);

          if (!response.ok) {
            throw new Error(`Qualitative Terms API request failed with status: ${response.status}`);
          }

          const data = await response.json();
          const qualitativeTerms = data.map(item => item.qualitative_terms.trim().toLowerCase());
          return qualitativeTerms;
        } catch (error) {
          console.error("Error fetching qualitative terms:", error.message);
          return [];
        }
      }

      function isAdverbOrPronoun(word, adverbs, pronouns) {
        return adverbs.includes(word.toLowerCase()) || pronouns.includes(word.toLowerCase());
      }

      function highlightTextareaContent(words, cssClass) {
        const content = inputArea.value;
        let highlightedContent = content;

        words.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          highlightedContent = highlightedContent.replace(regex, match => `<span class="${cssClass}">${match}</span>`);
        });

        inputArea.innerHTML = highlightedContent;
      }

      async function format() {
        console.log("Formatting...");

        data = {
          paragraphs: 0,
          sentences: 0,
          words: 0,
          adverbs: 0,
          qualitative: 0,
          quantitative: 0,
          characterCount: 0,
          pronouns: 0
        };

        let text = inputArea.value;

        if (text.trim() === '') {
          feedbackArea.innerHTML = '';
          return;
        }

        let paragraphs = text.split("\n");
        let inP = paragraphs.map(para => `<p>${para}</p>`);
        data.paragraphs = paragraphs.length;

        const adverbs = await fetchAdverbs();
        const pronouns = await fetchPronouns();
        const qualitativeTerms = await fetchQualitativeTerms();

        counters(adverbs, pronouns, qualitativeTerms);

        if (outputArea) {
          outputArea.innerHTML = inP.join(" ");
        }

  
        highlightTextareaContent(adverbs, 'highlight-adverb');
        highlightTextareaContent(pronouns, 'highlight-pronoun');
        highlightTextareaContent(qualitativeTerms, 'highlight-qualitative');
      }

      function counters(adverbs, pronouns, qualitativeTerms) {
        console.log("Counting...");
        data.words = countWords();
        data.sentences = countSentences();
        data.adverbs = countAdverbs(adverbs);
        data.qualitative = countQualitative(qualitativeTerms);
        data.quantitative = countQuantitative();
        data.characterCount = countCharacterCount();
        data.pronouns = countPronouns(pronouns);

        displayFeedback(adverbs, pronouns); 
      }

      function countWords() {
        let words = inputArea.value.split(/\s+/);
        return words.length;
      }

      function countSentences() {
        let sentences = inputArea.value.split(/[.!?]+/);
        return sentences.length;
      }

      function countAdverbs(adverbs) {
        console.log("Counting Adverbs...");
        let words = inputArea.value.split(/\s+/);
        let adverbsUsed = words.filter(word => {
          let isAdverb = isAdverbOrPronoun(word, adverbs, []);
          if (isAdverb) {
            console.log("Detected adverb:", word);
          }
          return isAdverb;
        });
        data.adverbs = adverbsUsed.length;
        return adverbsUsed.length;
      }

      function countQualitative(qualitativeTerms) {
        console.log("Counting Qualitative...");
        let words = inputArea.value.split(/\s+/);
        let qualitativeCount = words.filter(word => qualitativeTerms.includes(word.toLowerCase())).length;

        return qualitativeCount;
      }

      function countQuantitative() {
        console.log("Counting Quantitative...");
        let words = inputArea.value.split(/\s+/);
        let quantitativeCount = words.filter(word => !isNaN(word) && !word.includes('%')).length;
        data.quantitative = quantitativeCount;
        return quantitativeCount;
      }

      function countCharacterCount() {
        return inputArea.value.length;
      }

      function countPronouns(pronouns) {
        console.log("Counting Pronouns...");
        let words = inputArea.value.split(/\s+/);
        let pronounsUsed = words.filter(word => isAdverbOrPronoun(word, [], pronouns));
        data.pronouns = pronounsUsed.length;
        return pronounsUsed.length;
      }

      function displayFeedback(adverbs, pronouns) {
        console.log("Displaying Initial Feedback...");
        let feedback = "";

        let firstWord = inputArea.value.split(/\s+/)[0].toLowerCase(); 

        if (isAdverbOrPronoun(firstWord, adverbs, pronouns)) {
          if (
            (data.adverbs > 0 || data.pronouns > 0) &&
            data.qualitative > 0 &&
            data.quantitative > 0 &&
            data.characterCount >= 60 &&
            data.characterCount <= 138
          ) {
            feedback += "<div class='light-green-background highlight'>All requirements met. Good bullet point!</div>";
          }
        } else {
          feedback += "<div class='orange-background highlight'>Recommend starting with action words (adverbs) or possessive pronouns (their).</div>";
        }

        if (data.qualitative === 0) {
          feedback += "<div class='yellow-background highlight'>Consider adding qualitative terms like 'excellent' or 'outstanding'.</div>";
        }

        if (data.quantitative === 0) {
          feedback += "<div class='dark-green-background highlight'>Consider adding quantitative measures like numbers.</div>";
        }

        if (data.characterCount < 60 || data.characterCount > 138) {
          feedback += "<div class='red-background highlight'>Bullet comment is too long/short.</div>";
        }

        feedbackArea.innerHTML = '';

        if (feedback) {
          feedbackArea.innerHTML = feedback;

          let numRecommendations = feedbackArea.querySelectorAll('.highlight').length;
          setFeedbackBackgroundColor(numRecommendations);
        } else {
          console.error("Could not find feedbackArea element.");
        }
      }

      function setFeedbackBackgroundColor(numRecommendations) {

        switch (numRecommendations) {
          case 0:
            feedbackArea.style.backgroundColor = 'lightgreen';
            break;
          case 1:
            feedbackArea.style.backgroundColor = 'limegreen';
            break;
          case 2:
            feedbackArea.style.backgroundColor = 'yellow';
            break;
          case 3:
            feedbackArea.style.backgroundColor = 'orange';
            break;
          case 4:
            feedbackArea.style.backgroundColor = 'red';
            break;
          default:
            feedbackArea.style.backgroundColor = 'initial';
            break;
        }
      }

      window.format = format;
      format();

      form.querySelector("#rate-button").addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Button Clicked!");
        format();
      });

      clearButton.addEventListener("click", function (e) {
        e.preventDefault();
        inputArea.value = '';
        feedbackArea.innerHTML = '';
        console.log("Clear Button Clicked!");
      });

      copyButton.addEventListener("click", function (e) {
        e.preventDefault();
        inputArea.select();
        document.execCommand('copy');
        console.log("Copy Button Clicked!");
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
      });
    })();
  });
</script>
