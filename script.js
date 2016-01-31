(function() {
  class CSSProp {
    constructor(style, propName) {
      this.container = document.createElement('span');
      this.container.classList.add('style');
      this._styleEl = document.createElement('span');
      this._style = style;
      this._propName = propName;

      const parser = /translate([23]d)?\(|[\d.]+/ig;
      const styleStr = style[propName];

      let result;
      let pos = 0;

      this.container.appendChild(document.createTextNode(`  ${propName}: `));
      this.container.appendChild(this._styleEl);

      while (result = parser.exec(styleStr)) {
        this._styleEl.appendChild(document.createTextNode(styleStr.slice(pos, result.index)));
        pos = result.index + result[0].length;

        let span = document.createElement('span');
        span.classList.add('interactive-val');
        span.textContent = result[0];
        this._styleEl.appendChild(span);
      }

      this.container.appendChild(document.createTextNode(styleStr.slice(pos) + ';\n'));
      this.container.addEventListener('mousedown', event => this._onMouseDown(event));
    }

    _onMouseDown(event) {
      const interactiveEl = event.target.closest('.interactive-val');
      if (!interactiveEl) return;
      event.preventDefault();
      event.target.requestPointerLock();

      let yEl;
      let xEl;
      let yVal;
      let xVal;
      let directionMultiplier = -1;

      if (interactiveEl.textContent.startsWith('translate')) {
        xEl = interactiveEl.nextElementSibling;
        xVal = Number(xEl.textContent);
        yEl = xEl.nextElementSibling;
        yVal = Number(yEl.textContent);
        directionMultiplier = 1;
      }
      else {
        yEl = interactiveEl;
        yVal = Number(yEl.textContent);
      }

      let val = Number(interactiveEl.textContent);

      const onMove = event => {
        let multiplier = 1;
        if (event.altKey) multiplier = 0.01;

        yVal += event.movementY * multiplier * directionMultiplier;
        yEl.textContent = yVal;

        if (xEl) {
          xVal += event.movementX * multiplier * directionMultiplier;
          xEl.textContent = xVal;
        }

        this._style[this._propName] = this._styleEl.textContent;
      }

      const done = () => {
        document.exitPointerLock();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', done);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', done);
    }
  }

  class CSSRule {
    constructor(rule) {
      this.container = document.createElement('div');
      this._rule = rule;

      this.container.classList.add('rule');
      this.container.appendChild(document.createTextNode(`${rule.selectorText} {\n`));

      for (let prop of rule.style) {
        this.container.appendChild(new CSSProp(rule.style, prop).container);
      }

      this.container.appendChild(document.createTextNode('}\n\n'));
    }
  }

  class CSSEdit {
    constructor(styleSheets) {
      this.container = document.createElement('div');
      this.container.classList.add('css-editor');

      for (let sheet of styleSheets) {
        for (let rule of sheet.rules) {
          this.container.appendChild(new CSSRule(rule).container);
        }
      }
    }
  }

  self.CSSEdit = CSSEdit;
}());
