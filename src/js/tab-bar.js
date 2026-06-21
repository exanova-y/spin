(function () {
    const currentPath = location.pathname;

    const links = [
      { href: '/',                 label: 'Main' },
      { href: '/writing',          label: 'Writing' },
      { href: '/readlogs',         label: 'Feral scholar readlogs' },
      { href: '/me',               label: 'Me' },
      { href: '/gallery',          label: 'Gallery' },
      { href: '/social-graph',     label: 'Social graph' },
    ];

    const html = `
      <div class="tab-bar">
        ${links.map(l => {
          const isExternal = l.href.startsWith('http');
          const href = isExternal ? l.href : l.href;
          
          // Smart detection of active tab supporting both clean URLs and .html extensions
          const isActive = (currentPath === href) || 
                           (href !== '/' && currentPath.startsWith(href.replace('.html', ''))) ||
                           (href === '/' && (currentPath === '/' || currentPath.endsWith('index.html') || currentPath === ''));

          return `
          <a href="${href}" class="tab-link${isActive ? ' active' : ''}">
            ${l.label}
          </a>`;
        }).join('')}
        <button class="pane-toggle" title="Toggle pane background">❄</button>
      </div>`;

    document.currentScript.insertAdjacentHTML('afterend', html);

    document.currentScript.nextElementSibling
      .querySelector('.pane-toggle')
      .addEventListener('click', function () {
        const pane = this.closest('.pane');
        pane.classList.toggle('transparent');
        this.classList.toggle('active');
      });
  })();
