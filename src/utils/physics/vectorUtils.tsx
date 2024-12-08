import Paper from "paper";

export const createArrow = (
  from: paper.Point,
  direction: paper.Point,
  color: string,
  scale: number = 20,
  arrowSize: number = 8
): paper.Group => {
  const to = from.add(direction.multiply(scale));

  // Create the main line
  const line = new Paper.Path({
    segments: [from, to],
    strokeColor: color,
    strokeWidth: 2,
    strokeCap: "round",
  });

  // Create arrowhead
  const arrowHead = new Paper.Path({
    strokeColor: color,
    fillColor: color,
    strokeWidth: 1,
    closed: true,
  });

  const arrowDirection = direction.normalize(arrowSize);
  const arrowLeft = to.subtract(
    arrowDirection.rotate(315, new Paper.Point(0, 0))
  );
  const arrowRight = to.subtract(
    arrowDirection.rotate(45, new Paper.Point(0, 0))
  );

  arrowHead.add(to);
  arrowHead.add(arrowLeft);
  arrowHead.add(arrowRight);

  // Group the line and arrowhead
  return new Paper.Group([line, arrowHead]);
};
