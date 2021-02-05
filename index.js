class TreeNode {
  constructor(val, left, right) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function generateTree(lower, upper) {
  const delta = ((upper - lower) / 100) * TREE_SPAWN_MULTIPLIER;

  if (Math.random() > delta) {
    return [null, 0];
  }

  const middle = (upper - lower) / 2 + lower;

  const [leftNode, leftHeight] = generateTree(lower, middle);
  const [rightNode, rightHeight] = generateTree(middle, upper);

  const root = new TreeNode(middle, leftNode, rightNode);

  const height = Math.max(leftHeight, rightHeight) + 1;

  return [root, height];
}

function generateSVG(root, radius, p1, p2) {
  let lines = [];
  let circles = [];
  let texts = [];

  const xDelta = (p2.x - p1.x) / 2;
  const x = p1.x + xDelta;
  const y = p1.y + radius * 3;
  const point = new Point(x, y);

  circles.push(
    `<circle cx="${point.x}" cy="${
      point.y
    }" r="${radius}" stroke="black" stroke-width="${radius / 5}" fill="red" />`
  );

  texts.push(
    `<text x="${point.x}" y="${
      point.y
    }" text-anchor="middle" alignment-baseline="middle" fill="white" font-size="${radius}">${Math.round(
      root.val
    )}</text>`
  );

  if (root.left) {
    const [leftLines, leftCircles, leftTexts, leftPoint] = generateSVG(
      root.left,
      radius,
      new Point(p1.x, point.y),
      new Point(point.x, p2.y)
    );

    lines.push(
      `<line x1="${point.x}" y1="${point.y}" x2="${leftPoint.x}" y2="${
        leftPoint.y
      }" style="stroke: black; stroke-width: ${radius / 5}" />`
    );

    lines = lines.concat(leftLines);
    circles = circles.concat(leftCircles);
    texts = texts.concat(leftTexts);
  }

  if (root.right) {
    const [rightLines, rightCircles, rightTexts, rightPoint] = generateSVG(
      root.right,
      radius,
      new Point(point.x, point.y),
      new Point(p2.x, p2.y)
    );

    lines.push(
      `<line x1="${point.x}" y1="${point.y}" x2="${rightPoint.x}" y2="${
        rightPoint.y
      }" style="stroke: black; stroke-width: ${radius / 5}" />`
    );

    lines = lines.concat(rightLines);
    circles = circles.concat(rightCircles);
    texts = texts.concat(rightTexts);
  }

  return [lines, circles, texts, point];
}

function draw() {
  const srcPoint = new Point(0, 0);
  const dstPoint = new Point(100, 100);

  const yDelta = dstPoint.y - srcPoint.y;

  const [root, height] = generateTree(0, 100);

  const radius = Math.min(yDelta / 2 ** height, MAX_RADIUS);

  const [lines, circles, texts] = generateSVG(root, radius, srcPoint, dstPoint);
  const elements = [...lines, ...circles, ...texts];
  const innerHTML = elements.join("\n");
  document.getElementById("visual").innerHTML = innerHTML;
}

const TREE_SPAWN_MULTIPLIER = 8;
const MAX_RADIUS = 5;

draw();
