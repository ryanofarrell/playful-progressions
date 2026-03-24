const test = require('node:test');
const assert = require('node:assert');
const { initBlogFilter } = require('./blog-filter.js');

// Helper to setup DOM mock
function setupDOM(buttons, cards, container) {
  global.document = {
    querySelectorAll: (selector) => {
      if (selector === '.btn-filter') return buttons;
      if (selector === '.blog-post-card') return cards;
      return [];
    },
    getElementById: (id) => {
      if (id === 'blog-filters') return container;
      return null;
    },
    addEventListener: () => {},
    readyState: 'complete'
  };
}

test('blog-filter: should NOT throw TypeError when data-tags is missing (fix verified)', (t) => {
  const mockButton = {
    getAttribute: (name) => name === 'data-tag' ? 'test-tag' : null,
    addEventListener: (event, callback) => {
      mockButton.click = callback;
    },
    classList: {
      add: () => {},
      remove: () => {}
    }
  };

  const mockCardMissingTags = {
    getAttribute: (name) => null,
    style: { display: '' }
  };

  const mockContainer = {
    classList: {
      add: () => {},
      remove: () => {}
    }
  };

  setupDOM([mockButton], [mockCardMissingTags], mockContainer);
  initBlogFilter();

  // Trigger the click and it should NOT throw now
  assert.doesNotThrow(() => {
    mockButton.click.call(mockButton);
  });
  assert.strictEqual(mockCardMissingTags.style.display, 'none');
});

test('blog-filter: "all" tag should show all cards', (t) => {
  const mockButton = {
    getAttribute: (name) => name === 'data-tag' ? 'all' : null,
    addEventListener: (event, callback) => {
      mockButton.click = callback;
    },
    classList: {
      add: () => {},
      remove: () => {}
    }
  };

  const mockCard1 = {
    getAttribute: (name) => 'tag1',
    style: { display: 'none' }
  };
  const mockCard2 = {
    getAttribute: (name) => 'tag2',
    style: { display: 'none' }
  };

  const mockContainer = {
    classList: {
      add: () => {},
      remove: (cls) => {
        mockContainer.removedClass = cls;
      }
    }
  };

  setupDOM([mockButton], [mockCard1, mockCard2], mockContainer);
  initBlogFilter();
  mockButton.click.call(mockButton);

  assert.strictEqual(mockCard1.style.display, 'block');
  assert.strictEqual(mockCard2.style.display, 'block');
  assert.strictEqual(mockContainer.removedClass, 'filter-active');
});

test('blog-filter: should handle multiple tags correctly', (t) => {
  const mockButton = {
    getAttribute: (name) => name === 'data-tag' ? 'tag1' : null,
    addEventListener: (event, callback) => {
      mockButton.click = callback;
    },
    classList: {
      add: () => {},
      remove: () => {}
    }
  };

  const mockCardMatch = {
    getAttribute: (name) => 'tag1 tag2',
    style: { display: 'none' }
  };
  const mockCardNoMatch = {
    getAttribute: (name) => 'tag2 tag3',
    style: { display: 'block' }
  };

  const mockContainer = {
    classList: {
      add: () => {},
      remove: () => {}
    }
  };

  setupDOM([mockButton], [mockCardMatch, mockCardNoMatch], mockContainer);
  initBlogFilter();
  mockButton.click.call(mockButton);

  assert.strictEqual(mockCardMatch.style.display, 'block');
  assert.strictEqual(mockCardNoMatch.style.display, 'none');
});

test('blog-filter: should toggle active class on buttons', (t) => {
  const btn1 = {
    getAttribute: (name) => 'tag1',
    addEventListener: (event, callback) => { btn1.click = callback; },
    classList: {
      add: (cls) => { btn1.addedClass = cls; },
      remove: (cls) => { btn1.removedClass = cls; }
    }
  };
  const btn2 = {
    getAttribute: (name) => 'tag2',
    addEventListener: (event, callback) => { btn2.click = callback; },
    classList: {
      add: (cls) => { btn2.addedClass = cls; },
      remove: (cls) => { btn2.removedClass = cls; }
    }
  };

  const mockContainer = {
    classList: { add: () => {}, remove: () => {} }
  };

  setupDOM([btn1, btn2], [], mockContainer);
  initBlogFilter();

  btn1.click.call(btn1);
  assert.strictEqual(btn1.addedClass, 'active');
  assert.strictEqual(btn2.removedClass, 'active');
});
