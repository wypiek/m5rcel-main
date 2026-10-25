// Optional enhancements. Without JavaScript every tab panel is shown in order and the clock
// shows the time the page was rendered.

// 7.css tabs: show the tab strip and switch panels, with arrow-key support.
for (const tabs of document.querySelectorAll('[data-tabs]')) {
    const list = tabs.querySelector('[role=tablist]');
    const buttons = [...list.querySelectorAll('[role=tab]')];
    const select = button => {
        for (const other of buttons) {
            const active = other === button;
            other.setAttribute('aria-selected', String(active));
            other.tabIndex = active ? 0 : -1;
            document.getElementById(other.getAttribute('aria-controls')).hidden = !active;
        }
    };
    list.hidden = false;
    list.addEventListener('click', event => {
        const button = event.target.closest('[role=tab]');
        if (button) select(button);
    });
    list.addEventListener('keydown', event => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        if (!step) return;
        const next = buttons[(buttons.indexOf(document.activeElement) + step + buttons.length) % buttons.length];
        select(next);
        next.focus();
    });
    select(buttons.find(button => button.getAttribute('aria-selected') === 'true') ?? buttons[0]);
}

// Local time in Warsaw, kept current while the page is open.
const clock = document.getElementById('local-time');
if (clock) {
    const format = new Intl.DateTimeFormat('en-GB', { timeZone: clock.dataset.zone, hour: '2-digit', minute: '2-digit' });
    const tick = () => { clock.textContent = format.format(new Date()); clock.dateTime = clock.textContent; };
    tick();
    setInterval(tick, 15000);
}
