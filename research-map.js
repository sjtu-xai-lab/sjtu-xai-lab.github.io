/*
 * :Author: Shaobo Wang
 * :Date: 2022-04-08 21:32:17
 * :LastEditors: Shaobo Wang
 * :LastEditTime: 2022-04-09 14:32:08
 */

go.Shape.defineFigureGenerator("RoundedRectangle", function (shape, w, h) {
  // this figure takes one parameter, the size of the corner
  var p1 = 10; // default corner size
  if (shape !== null) {
    var param1 = shape.parameter1;
    if (!isNaN(param1) && param1 >= 0) p1 = param1; // can't be negative or NaN
  }
  p1 = Math.min(p1, w / 2);
  p1 = Math.min(p1, h / 2); // limit by whole height or by half height?
  var geo = new go.Geometry();
  // a single figure consisting of straight lines and quarter-circle arcs
  geo.add(
    new go.PathFigure(0, p1)
      .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
      .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
      .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
      .add(
        new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1)
      )
      .add(
        new go.PathSegment(
          go.PathSegment.Arc,
          90,
          90,
          p1,
          h - p1,
          p1,
          p1
        ).close()
      )
  );
  // don't intersect with two top corners when used in an "Auto" Panel
  geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0.3 * p1);
  geo.spot2 = new go.Spot(1, 1, -0.3 * p1, 0);
  return geo;
});

function init() {
  // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
  // For details, see https://gojs.net/latest/intro/buildingObjects.html
  const $ = go.GraphObject.make; // for conciseness in defining templates

  myDiagram = $(
    go.Diagram,
    "myDiagramDiv", // must be the ID or reference to div
    {
      allowCopy: false,
      isReadOnly: true,
      allowSelect: false,
      allowDrop: false,
      allowMove: false,
      initialAutoScale: go.Diagram.Uniform,
      // create a TreeLayout for the family tree
      layout: $(go.TreeLayout, 
        { angle: 90, 
          layerSpacing : 70,
          nodeSpacing: 0 
        }),
      // layout: $(go.TreeLayout, { nodeSpacing: 5 }),
    }
  );

  var bluegrad = $(go.Brush, "Linear", {
    0: "rgb(60, 204, 254)",
    1: "rgb(70, 172, 254)",
  });
  var pinkgrad = $(go.Brush, "Linear", {
    0: "rgb(255, 192, 203)",
    1: "rgb(255, 142, 203)",
  });
  var yellowgrad = $(go.Brush, "Linear", {
    0: "rgb(255, 241, 146)",
    1: "rgb(255, 212, 0)",
  });
  var greengrad = $(go.Brush, "Linear", {
    0: "rgb(171, 224, 152)",
    1: "rgb(197, 232, 183)",
  });

  // Set up a Part as a legend, and place it directly on the diagram
  myDiagram.add(
    $(
      go.Part,
      "Table",
      { position: new go.Point(0, -100), selectable: false },
      $(go.TextBlock, "Part", {
        row: 0,
        font: "18pt Helvetica, Arial, sans-serif",
      }), // end row 0
      $(
        go.Panel,
        "Horizontal",
        { row: 1, alignment: go.Spot.Left },
        $(go.Shape, "Rectangle", {
          desiredSize: new go.Size(50, 50),
          fill: bluegrad,
          margin: 5,
        }),
        $(go.TextBlock, "Mathematical Foundations", {
          font: "15pt Helvetica, bold Arial, sans-serif",
        })
      ), // end row 1
      $(
        go.Panel,
        "Horizontal",
        { row: 2, alignment: go.Spot.Left },
        $(go.Shape, "Rectangle", {
          desiredSize: new go.Size(50, 50),
          fill: pinkgrad,
          margin: 5,
        }),
        $(go.TextBlock, "Key research problems", {
          font: "15pt Helvetica, bold Arial, sans-serif",
        })
      ), // end row 2
      $(
        go.Panel,
        "Horizontal",
        { row: 3, alignment: go.Spot.Left },
        $(go.Shape, "Rectangle", {
          desiredSize: new go.Size(50, 50),
          fill: yellowgrad,
          margin: 5,
        }),
        $(go.TextBlock, "Theories of explaining DNNs", {
          font: "15pt Helvetica, bold Arial, sans-serif",
        })
      ), // end row 3
      $(
        go.Panel,
        "Horizontal",
        { row: 4, alignment: go.Spot.Left },
        $(go.Shape, "Rectangle", {
          desiredSize: new go.Size(50, 50),
          fill: greengrad,
          margin: 5,
        }),
        $(go.TextBlock, "Motivations", {
          font: "15pt Helvetica, bold Arial, sans-serif",
        })
      ) // end row 4
    )
  );

  // define Converters to be used for Bindings
  function partBrushConverter(part) {
    if (part === "F") return bluegrad;
    if (part === "P") return pinkgrad;
    if (part === "T") return yellowgrad;
    return greengrad;
  }
  // define Converters to be used for Bindings
  function partSizeConverter(part) {
    if (part === "F") return new go.Size(190, 100);
    if (part === "P") return new go.Size(180, 100);
    if (part === "T") return new go.Size(130, 100);
    return new go.Size(150, 140);
  }
  // define Converters to be used for Fonts
  function partFontConverter(part) {
    if (part === "F") return "16pt Helvetica, bold Arial, sans-serif";
    if (part === "P") return "13pt Helvetica, bold Arial, sans-serif";
    if (part === "T") return "6pt Helvetica,";
    return "6pt Helvetica, bold Arial, sans-serif";
  }

  // replace the default Node template in the nodeTemplateMap
  myDiagram.nodeTemplate = $(
    go.Node,
    "Auto",
    { deletable: false },
    new go.Binding("text", "name"),
    $(
      go.Shape,
      "RoundedRectangle",
      {
        // desiredSize: new go.Size(200, 72),
        desiredSize: new go.Size(130, 120),
        fill: greengrad,
        margin: 5,
      },
      new go.Binding("desiredSize", "part", partSizeConverter),
      {
        fill: greengrad,
        stroke: "black",
        stretch: go.GraphObject.Fill,
        alignment: go.Spot.Center,
      },
      new go.Binding("fill", "part", partBrushConverter)
    ),
    $(
      go.Panel,
      "Auto",
      //   $(
      //     go.TextBlock,
      //     {
      //       font: "bold 8pt Helvetica, bold Arial, sans-serif",
      //       alignment: go.Spot.Center,
      //       margin: 6,
      //     },
      //     new go.Binding("text", "name")
      //   ),
      $(
        "HyperlinkText",
        (node) => "#" + node.data.name,
        (node) => node.data.name,
        {
          margin: 5,
          maxSize: new go.Size(200, 180),
          // font: "8pt Helvetica, bold Arial, sans-serif",
          textAlign: "center",
        },
        new go.Binding("text", "name"),
        new go.Binding("font", "part", partFontConverter)
      )
    )
  );

  // define the Link template
  myDiagram.linkTemplate = $(
    go.Link, // the whole link panel
    // { routing: go.Link.Orthogonal, corner: 5, selectable: false },
    { corner: 5, selectable: true },
    $(go.Shape)
  ); // the default black link shape

  var nodeDataArray = [
    {
      key: 1,
      part: "F",
      name: "Game-theoretic\ninteractions",
    },
    {
      key: 2,
      part: "P",
      name: "Unifying different\nexplanations",
    },
    {
      key: 3,
      part: "P",
      name: "Extracting the\ncommon mechanisms\nof different methods",
    },
    {
      key: 4,
      part: "T",
      name: "Learning\nbaseline values\nof Shapley value\nexplanations",
    },
    {
      key: 5,
      part: "T",
      name: "Explain interactions\nbetween features\nin a DNN",
    },
    { key: 6, 
      part: "T", 
      name: "Explain and unify\nattribution\nexplanations" 
    },
    { key: 7, part: "T", name: "Explain the\nsemantic concepts\nof a DNN" },
    {
      key: 8,
      part: "T",
      name: "Discover and\nexplain the\nrepresentation\nbottleneck\nof DNNs",
    },
    { key: 9, part: "T", name: "Explain the\ngeneralization\nability" },
    { key: 10, part: "T", name: "Explain the\nadversarial\ntransferability" },
    { key: 11, part: "T", name: "Explain the\naesthetic\nappreciation" },
    { key: 12, part: "T", name: "Explain the\nadversarial\nrobustness" },
    {
      key: 13,
      name: "Address the\ntheoretical flaws \nwith baseline values\nof Shapley values",
    },
    {
      key: 14,
      name: "Explain a DNN\nfrom interactions\nbetween features,\ninstead of the\nimportance of an\n individual feature",
    },
    {
      key: 15,
      name: "Attribution methods\nare based on\nvarious heuristics,\nlacking common\ntheoretical\n mechanisms",
    },
    {
      key: 16,
      name: "Provide a new\ntaxonomy of\nsemantic concepts\nw.r.t. complexities",
    },
    {
      key: 17,
      name: "Explore the\ncommon tendency\nof feature\nrepresentations\nof DNNs",
    },
    {
      key: 18,
      name: "Most techniques\nstrengthening the\ngeneralization\nabilities are\nheuristic",
    },
    {
      key: 19,
      name: "Current studies of\nboosting adversarial\ntransferability are\nmainly based\non heuristics and\nobservasions",
    },
    {
      key: 20,
      name: "Existing works lack\na  mathematical\nmodeling for\nthe aesthetic\nappreciation",
    },
    {
      key: 21,
      name: "The essence of\nadversarial attack\nand robustness\nis still unclear",
    },
    // { key: 1, name: "Game-theoretic interactions" },
    // { key: 2, name: "Unifying different explanations" },
    // { key: 3, name: "Extracting the common mechanisms of different methods" },
    // { key: 4, name: "Learning baseline values of Shapley value explanations" },
    // { key: 5, name: "Explain interactions between features in a DNN" },
    // { key: 6, name: "Explain and unify attribution explanations" },
    // { key: 7, name: "Explain the semantic concepts of a DNN" },
    // {
    //   key: 8,
    //   name: "Discover and explain the representation bottleneck of DNNs",
    // },
    // { key: 9, name: "Explain the generalization ability" },
    // { key: 10, name: "Explain the adversarial transferability" },
    // { key: 11, name: "Explain the aesthetic appreciation" },
    // { key: 12, name: "Explain the adversarial robustness" },
    // {
    //   key: 13,
    //   name: "Address the theoretical flaws with baseline values of Shapley values",
    // },
    // {
    //   key: 14,
    //   name: "Explain a DNN from interactions between features, instead of the importance of an individual feature",
    // },
    // {
    //   key: 15,
    //   name: "Attribution methods are based on various heuristics, lacking common theoretical mechanisms",
    // },
    // {
    //   key: 16,
    //   name: "Provide a new taxonomy of semantic concepts w.r.t. complexities",
    // },
    // {
    //   key: 17,
    //   name: "Explore the common tendency of feature representations of DNNs",
    // },
    // {
    //   key: 18,
    //   name: "Most techniques strengthening the generalization abilities are heuristic",
    // },
    // {
    //   key: 19,
    //   name: "Current studies to explore factors influencing the transferability are based on experiments",
    // },
    // {
    //   key: 20,
    //   name: "Existing works lack a  mathematical modeling for the aesthetic appreciation",
    // },
    // {
    //   key: 21,
    //   name: "Many techniques boosting the robustness are heuristic, whose mechanisms are largely missing",
    // },
  ];
  var linkDataArray = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 2, to: 6 },
    { from: 2, to: 7 },
    { from: 2, to: 8 },
    { from: 2, to: 9 },
    { from: 2, to: 10 },
    { from: 2, to: 11 },
    { from: 2, to: 12 },
    { from: 3, to: 6 },
    { from: 3, to: 9 },
    { from: 3, to: 10 },
    { from: 3, to: 12 },
    { from: 4, to: 13 },
    { from: 5, to: 14 },
    { from: 6, to: 15 },
    { from: 7, to: 16 },
    { from: 8, to: 17 },
    { from: 9, to: 18 },
    { from: 10, to: 19 },
    { from: 11, to: 20 },
    { from: 12, to: 21 },
  ];
  myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}
window.addEventListener("DOMContentLoaded", init);
// var $ = go.GraphObject.make;
// myDiagram = $(go.Diagram, "myDiagramDiv", {
//   contentAlignment: go.Spot.TopCenter,
//   isReadOnly: true,
//   allowSelect: false,
//   allowDrop: false,
//   allowMove: false,
// });

// myDiagram.nodeTemplate = $(
//   go.Node,
//   "Auto",
//   $(go.Shape, "Ellipse", { fill: "lightskyblue" }),
//   $(
//     "HyperlinkText",
//     (node) => "#" + node.data.name,
//     (node) => node.data.name,
//     { margin: 5, maxSize: new go.Size(200, 150), textAlign: "center" }
//   )
// );
// myDiagram.layout = $(go.TreeLayout, { layerSpacing: 50, nodeSpacing: 10 });
// myDiagram.model = new go.TreeModel([
//   { key: "1", name: "Game-theoretic interactions" },
//   { key: "2", parent: "1", name: "Unifying different explanations" },
//   {
//     key: "3",
//     parent: "1",
//     name: "Extracting the common mechanisms of different methods",
//   },
//   {
//     key: "4",
//     parent: "2",
//     name: "Learning baseline values of Shapley value explanations",
//   },
//   {
//     key: "5",
//     parent: "2",
//     name: "Explain interactions between features in a DNN",
//   },
//   { key: "6", parent: "2", name: "Explain and unify attribution explanations" },
//   { key: "7", parent: "2", name: "Explain the semantic concepts of a DNN" },
//   {
//     key: "8",
//     parent: "2",
//     name: "Discover and explain the representation bottleneck of DNNs",
//   },
//   { key: "9", parent: "2", name: "Explain the adversarial transferability" },
//   { key: "10", parent: "2", name: "Explain the aesthetic appreciation" },
//   { key: "11", parent: "2", name: "Explain the adversarial robustness" },
//   { key: "12", parent: "2", name: "Explain the adversarial transferability" },
// ]);
