class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/* Binary Search Tree class */
class BinarySearchTree {
  constructor(root) {
    this.root = root;
  }

  find(key) {
    return this.findRec(key, this.root);
  }

  async findRec(key, currNode) {
    let value = null;

    if (currNode == null) {
      throw new Error("Key " + key + " not found");
    }

    this.highlight(currNode.key);
    await waitAsync(1000);

    if (key === currNode.key) {
      value = currNode.key;
      found(currNode.key);
    } else if (key < currNode.key) {
      value = this.findRec(key, currNode.left);
    } else {
      value = this.findRec(key, currNode.right);
    }

    return value;
  }
}

class BinarySearchTreeNode {
  constructor(key, left, right) {
    this.key = key;
    this.left = left;
    this.right = right;
  }

  get height() {
    const leftHeight = this.left ? this.left.height : 0;
    const rightHeight = this.right ? this.right.height : 0;
    return Math.max(leftHeight, rightHeight) + 1;
  }
}

/* implements SVG methods */
class SVGBinarySearchTree extends BinarySearchTree {
  constructor(root) {
    super(root);
  }

  generate(root, radius, p1, p2) {
    let lines = [];
    let circles = [];
    let texts = [];

    const xDelta = (p2.x - p1.x) / 2;
    const x = p1.x + xDelta;
    const y = p1.y + radius * 3;
    const point = new Point(x, y);

    const circle = new SVGCircle(
      point,
      root.key,
      radius,
      "black",
      radius / 5,
      "gray"
    );
    circles.push(circle);

    texts.push(new SVGText(root.key, point, radius, "white"));

    if (root.left) {
      const [leftCircle, leftLines, leftCircles, leftTexts] = this.generate(
        root.left,
        radius,
        new Point(p1.x, point.y),
        new Point(point.x, p2.y)
      );

      lines.push(new SVGLine(circle, leftCircle, "black", radius / 5));

      lines = [...lines, ...leftLines];
      circles = [...circles, ...leftCircles];
      texts = [...texts, ...leftTexts];
    }

    if (root.right) {
      const [rightCircle, rightLines, rightCircles, rightTexts] = this.generate(
        root.right,
        radius,
        new Point(point.x, point.y),
        new Point(p2.x, p2.y)
      );

      lines.push(new SVGLine(circle, rightCircle, "black", radius / 5));

      lines = [...lines, ...rightLines];
      circles = [...circles, ...rightCircles];
      texts = [...texts, ...rightTexts];
    }

    return [circle, lines, circles, texts];
  }

  draw() {
    const srcPoint = new Point(0, 0);
    const dstPoint = new Point(100, 100);

    const yDelta = dstPoint.y - srcPoint.y;

    const height = this.root.height;
    radius = Math.min(yDelta / 2 ** height, MAX_RADIUS);

    [, lines, circles, texts] = this.generate(
      this.root,
      radius,
      srcPoint,
      dstPoint
    );

    lines = lines.map((line) => line.generate());
    circles = circles.map((circle) => circle.generate());
    texts = texts.map((text) => text.generate());

    elements = [...lines, ...circles, ...texts];
    const innerHTML = elements.join("\n");
    document.getElementById("visual").innerHTML = innerHTML;

    tree.find(Math.round(Math.random() * 100));
  }

  highlight(key) {
    for (const element of document.getElementsByTagName("circle")) {
      if (+element.dataset.value === key) {
        element.style.fill = "coral";
      }
    }

    for (const element of document.getElementsByTagName("line")) {
      if (+element.dataset.dst === key) {
        element.style.stroke = "coral";
        element.style.strokeWidth = element.style.strokeWidth * 2;
      }
    }
  }
}

class SVGText {
  constructor(key, point, fontSize, fill) {
    this.key = key;
    this.point = point;
    this.fontSize = fontSize;
    this.fill = fill;
  }

  generate() {
    return `<text data-key="${this.key}" x="${this.point.x}" y="${this.point.y}" font-size="${this.fontSize}" fill="${this.fill}" text-anchor="middle" alignment-baseline="middle">${this.key}</text>`;
  }
}

class SVGCircle {
  constructor(point, key, radius, stroke, strokeWidth, fill) {
    this.point = point;
    this.key = key;
    this.radius = radius;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.fill = fill;
  }

  generate() {
    return `<circle data-key="${this.key}" cx="${this.point.x}" cy="${this.point.y}" r="${this.radius}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" fill="${this.fill}"></circle>`;
  }
}

class SVGLine {
  constructor(src, dst, stroke, strokeWidth) {
    this.src = src;
    this.dst = dst;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
  }

  generate() {
    return `<line data-src="${this.src.key}" data-dst="${this.dst.key}" x1="${this.src.point.x}" y1="${this.src.point.y}" x2="${this.dst.point.x}" y2="${this.dst.point.y}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}"></line>`;
  }
}

function generateTree(lower, upper) {
  const delta = ((upper - lower) / 100) * TREE_SPAWN_MULTIPLIER;

  if (Math.random() > delta) {
    return null;
  }

  const middle = (upper - lower) / 2 + lower;

  const leftNode = generateTree(lower, middle);
  const rightNode = generateTree(middle, upper);

  const root = new BinarySearchTreeNode(
    Math.round(middle),
    leftNode,
    rightNode
  );

  return root;
}

function found(val) {
  for (const element of document.getElementsByTagName("circle")) {
    if (+element.dataset.value === val) {
      element.style.fill = "lime";
    }
  }
}

async function findNode(val) {
  let point;

  for (const element of document.getElementsByTagName("circle")) {
    if (+element.dataset.value === val) {
      point = new Point(element.getAttribute("cx"), element.getAttribute("cy"));
    }
  }

  circles.push(
    `<circle data-focus="true" cx="${point.x}" cy="${point.y}" r="${
      radius * 1.2
    }" stroke="coral" stroke-width="${radius / 3}" fill="none" />`
  );

  elements = [...lines, ...circles, ...texts];
  const innerHTML = elements.join("\n");
  document.getElementById("visual").innerHTML = innerHTML;

  await waitAsync(1000);

  for (const element of document.getElementsByTagName("circle")) {
    if (Boolean(element.dataset.focus) === true) {
      element.style.transform = `translate(${10}px, ${10}px)`;
      element.style.transition = "all 1.5s linear";
    }
  }
}

function deleteNode(srcVal, dstVal) {
  let srcPoint;
  let dstPoint;

  for (const element of document.getElementsByTagName("circle")) {
    if (+element.dataset.value === srcVal) {
      srcPoint = new Point(
        element.getAttribute("cx"),
        element.getAttribute("cy")
      );
    } else if (+element.dataset.value === dstVal) {
      dstPoint = new Point(
        element.getAttribute("cx"),
        element.getAttribute("cy")
      );
    }
  }

  const movement = new Point(srcPoint.x - dstPoint.x, srcPoint.y - dstPoint.y);

  const texts = document.getElementsByTagName("text");
  const circles = document.getElementsByTagName("circle");
  const lines = document.getElementsByTagName("line");
  const elements = [...texts, ...circles, ...lines];

  for (const element of elements) {
    if (+element.dataset.value === srcVal) {
      element.classList.add("deleted");
    } else if (+element.dataset.value === dstVal) {
      element.style.transform = `translate(${movement.x}px, ${movement.y}px)`;
      element.style.transition = "all 0.5s linear";
    }
  }
}

function waitAsync(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TREE_SPAWN_MULTIPLIER = 8;
const MAX_RADIUS = 5;

let radius;
let texts, circles, lines;
let elements;

const root = generateTree(0, 100);
const tree = new SVGBinarySearchTree(root);
tree.draw();
