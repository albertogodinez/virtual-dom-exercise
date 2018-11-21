const diff = (dom, node, parent) => {
  // if we find any new children, append it
  if (dom) {
    // typeof text so just assign to the value
    if (typeof node === 'string') {
      dom.nodeValue = node;
      return dom;
    }
    // checking props
    if (typeof node.nodeName === 'function') {
      const component = new node.nodeName(node.props);
      const renderedComp = component.render(component.props, component.state);
      diff(dom, renderedComp);
      return dom;
    }
    // check if new children exists using lengths
    if (node.children.length !== dom.childNodes.length) {
      // rendering the new node and appending it
      dom.appendChild(renderNode(node.children[node.children.length - 1]));
    }
    // check the difference of each child
    dom.childNodes.forEach((child, i) => diff(child, node.children[i]));
  } else {
    // if no dom is provided we render our virtual node and append
    // it to the parent
    const newDom = renderNode(node);
    parent.appendChild(newDom);
    //**NOTE** the code on top is only applicable on the first run
    // - when there is no DOM rendered yet and the only place where
    // we give parent in its paramaters. So we can use if for inital rendering
  }
  return dom;
};

function renderNode(node) {
  let $el;
  // using destructuring we retrieve type, props, children
  const { type, props, children } = node;
  // if node is typeof text then we return text Node
  if (typeof node === 'string') return document.createTextNode(node);
  if (typeof type === 'string') {
    // Otherwise we create an element with type and set its
    // props from the props object
    $el = document.createElement(type);

    // iterate through props and setAttributes to element
    for (let key in props) {
      $el.setAttribute(key, props[key]);
    }
  } else if (typeof type === 'function') {
    // Component was passed
    // so initialize Component
    const component = new type(props);
    $el = renderNode(component.render(component.props, component.state));
    component.base = $el;
  }
  // we do the same thing for all of the children
  children.forEach(child => $el.appendChild(renderNode(child)));
  return $el;
}

// renderComponent does the following
// - grabs the old base
// (current DOM before change that is saved in component base)
// - Renders virtual DOM - that we can get from component.render method
// and saves it into component.base
// - replaces the old child with the new one
function renderComponent(component) {
  // creates the virtual DOM
  const rendered = component.render(component.props, component.state);
  // compares it with the current DOM state
  component.base = diff(component.base, rendered);
  return component;
}

// Component is the base class for all of the classes and includes
// constructor as well as setState method which are used in all
// components
class Component {
  constructor(props) {
    // initialize component with props
    this.props = props;
    // state field is initialized as empty
    this.state = {};
  }

  // setState rewrites our state and calls renderComponet and includes itself
  // **NOTE** setState updates its state object and makes component re-render
  setState(state) {
    this.state = { ...state };
    renderComponent(this);
  }
}

// The following method creates a DOM element with type.
// It sets its attributes
// Lastly, it appends child nodes with the check for text nodes
// this creates a virtual DOM
function h(type, props, ...children) {
  return { type, props, children };
}

function getRandItem(list) {
  return list[Math.round(Math.random() * (list.length - 1))];
}

// root class
class App extends Component {
  render() {
    return h(
      'div',
      { class: 'app' },
      h('h1', null, 'Virtual Dom Example'),
      h(Fruit)
    );
  }
}

// example class
class Fruit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fruits: ['apples', 'bananas', 'strawberries', 'grapes']
    };
    const $addFruit = document.getElementById('addFruit');
    // will append the newly added element
    $addFruit.addEventListener('click', () => {
      this.setState({
        fruits: [...this.state.fruits, getRandItem(this.state.fruits)]
      });
    });
  }
  addFruit() {
    this.setState({
      fruits: [...this.state.fruits, getRandomItemFromArray(this.state.fruits)]
    });
  }
  render(props, state) {
    return h('ul', null, ...state.fruits.map(fruit => h('li', null, fruit)));
  }
}

// INITIAL CALLS
const render = (node, parent) => {
  diff(undefined, node, parent);
};

const $root = document.getElementById('root');
render(h(App), $root);

// A few things that I didn't get to implement
// - dive in deeper to how React implements their diff algorithm
// - implement JSX using a tool such as jsx pragma
// - implement modules to separate the classes and just import when necessary
