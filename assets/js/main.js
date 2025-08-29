/**
* Template Name: iPortfolio
* Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function () {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      // preloader.remove();
      preloader.style.display = "none";
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  let typedInstance = null;
  window.initTyped = function () {
    const selectTyped = document.querySelector('.typed');
    if (selectTyped) {
      if (typedInstance) {
        typedInstance.destroy();
      }
      let typed_strings = selectTyped.getAttribute('data-typed-items');
      typed_strings = typed_strings.split(',');
      typedInstance = new Typed('.typed', {
        strings: typed_strings,
        loop: true,
        typeSpeed: 20,
        backSpeed: 20,
        backDelay: 2000,
        //smartBackspace: false, // Evita borrar solo la diferencia entre cadenas
        startDelay: 300,
      });
    }
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function (direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();

document.addEventListener("DOMContentLoaded", () => {
  initTyped();
  const defaultLang = "es";
  const savedLang = localStorage.getItem("lang") || defaultLang;
  setLanguaje(savedLang);
  console.log("Language set to:", savedLang);

  if (window.location.pathname === "/index.html") {
    document.querySelectorAll('.lang-switch').forEach(button => {
      button.classList.remove('lang-switch-active');
    });
    document.querySelector(`.lang-switch[data-lang="${savedLang}"]`).classList.add('lang-switch-active');
  }

  document.querySelectorAll('.lang-switch').forEach(button => {
    button.addEventListener('click', function () {
      if (this.classList.contains('lang-switch-active')) return;

      document.querySelectorAll('.lang-switch').forEach(switcher => {
        switcher.classList.remove('lang-switch-active');
      });

      this.classList.add('lang-switch-active');

      const lang = this.getAttribute('data-lang');
      localStorage.setItem('lang', lang);
      setLanguaje(lang);
    });
  });

  function setLanguaje(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');

      if (!el.dataset.original) {
        el.dataset.original = el.innerHTML;
      }

      if (lang === "en" && translations[lang] && translations[lang][key]) {
        if (el.classList.contains("typed")) {
          el.setAttribute("data-typed-items", translations[lang][key]);
        } else {
          el.innerHTML = translations[lang][key];
        }
      } else {
        if (el.classList.contains("typed")) {
          el.setAttribute("data-typed-items", translations["es"]["hero_typed_items"]);
        } else {
          el.innerHTML = el.dataset.original;
        }
      }
    });
    // Reiniciar el efecto Typed
    initTyped();
  }

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  const project = projects[projectId];
  let infoHTML = "";

  const lang = localStorage.getItem("lang") || "es";
  const languajeES = lang === "es";

  if (project) {
    setLanguaje(lang);
    document.querySelector(".portfolio-info h3").textContent = languajeES ? `Proyecto: ${project.title}` : `Project: ${project.title}`;
    console.log(languajeES);

    if (languajeES) {
      infoHTML = `
        <li><strong>Categoría</strong>: ${project.category}</li>
        <li><strong>Cliente</strong>: ${project.client}</li>
        <li><strong>Fecha de Inicio</strong>: ${project.startDate}</li>
        <li><strong>Fecha de Entrega</strong>: ${project.endDate}</li>
      `;
    } else {
      infoHTML = `
        <li><strong>Category</strong>: ${project.categoryEn}</li>
        <li><strong>Client</strong>: ${project.clientEn}</li>
        <li><strong>Start Date</strong>: ${project.startDate}</li>
        <li><strong>End Date</strong>: ${project.endDate}</li>
      `;
    }

    if (project.url) {
      infoHTML += `
        <li><strong>URL</strong>: <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.url}</a></li>
      `;
    }
    if (project.repo) {
      infoHTML += `
        <li><strong>GitHub</strong>: <a href="${project.repo}" target="_blank" rel="noopener noreferrer">${project.repo}</a></li>
      `;

    }

    document.querySelector(".portfolio-info ul").innerHTML = infoHTML;
    document.querySelector(".portfolio-description h2").textContent = languajeES ? project.description : project.descriptionEn;
    document.querySelector(".portfolio-description p").textContent = languajeES ? project.details : project.detailsEn;

    // Rellenar imágenes del slider
    const swiperWrapper = document.querySelector(".swiper-wrapper");
    const extraStyle = (projectId === "gotopadel" || projectId === "super" || projectId === "burguer" || projectId === "maps") ? 'style="width: 300px; max-width: 100%; margin-left:32%"' : "";

    swiperWrapper.innerHTML = project.images.map(src => `
      <div class="swiper-slide">
        <img src="${src}" alt="" ${extraStyle}>
      </div>`).join('');
  }

  function downloadCV(english = false) {
    const preloader = document.querySelector('#preloader');
    console.log(preloader);
    if (preloader) preloader.style.display = 'block'; // Mostrar loader

    fetch(`https://cv.drbarranco.es/api/cv/pdf?english=${english}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = english ? "Daniel_Rodriguez_CV_EN.pdf" : "Daniel_Rodriguez_CV.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error downloading CV:", error);
        alert("Ocurrió un error al descargar el CV. Inténtalo de nuevo más tarde.");
      })
      .finally(() => {
        if (preloader) preloader.style.display = 'none'; // Ocultar loader
      });
  }

  let downloadCv = document.getElementById("downloadCV");
  let downloadEn = document.getElementById("downloadCV-en");

  if (downloadCv) {
    document.getElementById("downloadCV").addEventListener("click", function () {
      downloadCV();
    });
  }
  if (downloadEn) {
    document.getElementById("downloadCV-en").addEventListener("click", function () {
      downloadCV(true);
    });
  }

});
