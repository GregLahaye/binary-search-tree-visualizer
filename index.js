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

    this.highlightCircle(currNode.key);
    this.highlightLine(currNode.key);
    await waitAsync(1000);

    if (key === currNode.key) {
      value = currNode.key;
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

    const circle = new SVGCircle(point, root.key, radius);
    circles.push(circle);

    texts.push(new SVGText(root.key, point, radius));

    if (root.left) {
      const [leftCircle, leftLines, leftCircles, leftTexts] = this.generate(
        root.left,
        radius,
        new Point(p1.x, point.y),
        new Point(point.x, p2.y)
      );

      lines.push(new SVGLine(circle, leftCircle));

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

      lines.push(new SVGLine(circle, rightCircle));

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
    const radius = Math.min(yDelta / 2 ** height, MAX_RADIUS);

    const [, lines, circles, texts] = this.generate(
      this.root,
      radius,
      srcPoint,
      dstPoint
    );

    this.lines = lines;
    this.circles = circles;
    this.texts = texts;

    this.render();
  }

  render() {
    const lineElements = this.lines.map((line) => line.generate());
    const circleElements = this.circles.map((circle) => circle.generate());
    const textElements = this.texts.map((text) => text.generate());

    const elements = [...lineElements, ...circleElements, ...textElements];
    const innerHTML = elements.join("\n");
    document.getElementById("visual").innerHTML = innerHTML;
  }

  highlightCircle(key) {
    for (const circle of this.circles) {
      if (circle.key === key) {
        circle.fill = "green";
      }
    }

    this.render();
  }

  highlightLine(key) {
    for (const line of this.lines) {
      if (line.dst.key === key) {
        line.stroke = "green";
        line.strokeWidth *= 2;
      }
    }

    this.render();
  }
}

class SVGText {
  constructor(key, point, fontSize) {
    this.key = key;
    this.point = point;
    this.fontSize = fontSize;
    this.fill = this.defaultFill;
  }

  get defaultFill() {
    return "white";
  }

  generate() {
    return `<text data-key="${this.key}" x="${this.point.x}" y="${this.point.y}" font-size="${this.fontSize}" fill="${this.fill}" text-anchor="middle" alignment-baseline="middle">${this.key}</text>`;
  }
}

class SVGCircle {
  constructor(point, key, radius) {
    this.point = point;
    this.key = key;
    this.radius = radius;
    this.stroke = this.defaultStroke;
    this.strokeWidth = this.defaultStrokeWidth;
    this.fill = this.defaultFill;
  }

  get defaultStroke() {
    return "black";
  }

  get defaultStrokeWidth() {
    return this.radius / 5;
  }

  get defaultFill() {
    return "gray";
  }

  generate() {
    return `<circle data-key="${this.key}" cx="${this.point.x}" cy="${this.point.y}" r="${this.radius}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" fill="${this.fill}"></circle>`;
  }
}

class SVGLine {
  constructor(src, dst) {
    this.src = src;
    this.dst = dst;
    this.stroke = this.defaultStroke;
    this.strokeWidth = this.defaultStrokeWidth;
  }

  get defaultStroke() {
    return "black";
  }

  get defaultStrokeWidth() {
    return this.src.radius / 5;
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

function waitAsync(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TREE_SPAWN_MULTIPLIER = 8;
const MAX_RADIUS = 5;

const root = generateTree(0, 100);
const tree = new SVGBinarySearchTree(root);
tree.draw();
tree.find(28);
