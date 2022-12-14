javascript: !(function (undefined) {
  const INTERVAL_MS = 1500;

  const loadScripts = () => {
    const modules = [
      'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
      'https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js',
    ];
    modules.forEach((url) => {
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  };

  const loadCSS = () => {
    const files = ['https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css'];
    files.forEach((file) => {
      var link = document.createElement('link');
      link.href = file.substr(0, file.lastIndexOf('.')) + '.css';
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.media = 'screen,print';
      document.getElementsByTagName('head')[0].appendChild(link);
    });
  };

  const capture = (currentPage) => {
    return new Promise((resolve) => {
      const filename = `${currentPage}.jpg`;
      const canvas = document.querySelector(
        '#main_screen_layer > canvas:nth-of-type(1)'
      );
      canvas.toBlob((blob) => {
        resolve({ filename, blob });
      });
    });
  };

  const createZipBlob = async (images) => {
    const zip = new JSZip();

    images.forEach((image) => {
      zip.file(image.filename, image.blob, { binary: true });
    });

    return await zip.generateAsync({ type: 'blob' });
  };

  const downloadZip = async (captures) => {
    const zipBlob = await createZipBlob(captures);
    const bookTitle = document.title;
    const zipName = `${bookTitle}.zip`;
    saveAs(zipBlob, zipName);
  };

  const goToNextPage = () => {
    const screen = document.querySelector(
      '#main_screen_layer > canvas:nth-of-type(1)'
    );
    screen.click();
    const e = document.createEvent('MouseEvents');
    e.initEvent('wheel', true, true);
    e.deltaY = 800;
    screen.dispatchEvent(e);
  };

  const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
  const isShownEndDialog = () =>
    document.querySelector('[class^=Colophon_volumeWrapper]') &&
    document.querySelector('[class^=Colophon_volumeWrapper]').offsetParent !==
      null;

  (async () => {
    loadCSS();
    loadScripts();
    await sleep(1000); // HACKME

    const notyf = new Notyf({
      position: { x: 'left', y: 'bottom' },
    });
    notyf.success('????????????????????????');

    const captures = [];
    while (1) {
      const counter = document.querySelector('.rc-slider-handle');
      const current = Number(counter.getAttribute('aria-valuenow')) + 1;
      const tail = Number(counter.getAttribute('aria-valuemax')) + 1;
      console.log(current, tail);

      captures.push(await capture(current));
      await goToNextPage();
      await sleep(INTERVAL_MS);

      if (Number(current) >= Number(tail)) break;
      if (isShownEndDialog()) break;
    }

    console.log('END', captures);
    notyf.success('????????????????????????ZIP?????????????????????????????????');

    await downloadZip(captures);
  })();
})();
