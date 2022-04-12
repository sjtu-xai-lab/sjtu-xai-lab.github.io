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

  var diagram = $(
    go.Diagram,
    "myDiagramDiv", // id of DIV
    {
      initialAutoScale: go.Diagram.UniformToFill,
      autoScale: go.Diagram.UniformToFill,
      initialContentAlignment: go.Spot.TopCenter,
      allowMove: false,
      layout: $(
        go.TreeLayout,
        {
          angle: 90,
          nodeSpacing: 5,
          layerSpacing: 60,
          layerStyle: go.TreeLayout.LayerSiblings,
          compaction: go.TreeLayout.CompactionBlock,
          arrangement: go.TreeLayout.ArrangementVertical,
          treeStyle: go.TreeLayout.StyleLayered,
          //   breadthLimit: 1,
        }
        // new go.Binding("nodeSpacing", "part", partSpaceConverter)
      ),
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
    0: "#98FB98",
    1: "#90EE90",
  });

  // Set up a Part as a legend, and place it directly on the diagram
  diagram.add(
    $(
      go.Part,
      "Table",
      { position: new go.Point(0, 0), selectable: false },
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
    if (part === "F") return new go.Size(220, 100);
    if (part === "P") return new go.Size(180, 100);
    if (part === "T") return new go.Size(90, 100);
    return new go.Size(90, 150);
  }
  // define Converters to be used for Fonts
  function partFontConverter(part) {
    if (part === "F") return "16pt Helvetica, bold Arial, sans-serif";
    if (part === "P") return "13pt Helvetica, bold Arial, sans-serif";
    if (part === "T") return "6pt Helvetica,";
    return "6pt Helvetica, bold Arial, sans-serif";
  }

  // Define a node template showing class names.
  // Clicking on the node opens up the documentation for that class.
  diagram.nodeTemplate = $(
    go.Node,
    "Auto",
    $(
      go.Panel,
      "Auto",
      $(
        go.Shape,
        "RoundedRectangle",
        {
          fill: greengrad,
          stroke: "black",
          stretch: go.GraphObject.Fill,
          alignment: go.Spot.TopCenter,
        },
        new go.Binding("fill", "part", partBrushConverter)
      ),

      $(
        go.TextBlock,
        {
          // font: "bold 13px Helvetica, bold Arial, sans-serif",
          stroke: "black",
          margin: 3,
          // maxLines: 10,
          width: 115,
          height: 160,
          textAlign: "center",
          verticalAlignment: go.Spot.Center,
        },
        new go.Binding("desiredSize", "part", partSizeConverter),
        new go.Binding("text", "name"),
        new go.Binding("font", "part", partFontConverter)
      )
    )
  );

  // for middle
  diagram.nodeTemplateMap.add(
    "middle",

    $(
      go.Node,
      "Spot",
      $(
        "HyperlinkText",
        // compute the URL to open for the documentation
        function (node) {
          return "#c" + node.data.chapter;
        },
        // define the visuals for the hyperlink, basically the whole node:
        $(
          go.Panel,
          "Auto",
          $(
            go.Shape,
            "RoundedRectangle",
            {
              fill: yellowgrad,
              stroke: "black",
              stretch: go.GraphObject.Fill,
              alignment: go.Spot.TopCenter,
            },
            new go.Binding("fill", "part", partBrushConverter)
          ),

          $(
            go.TextBlock,
            {
              // font: "bold 13px Helvetica, bold Arial, sans-serif",
              stroke: "black",
              margin: 3,
              // maxLines: 10,
              width: 115,
              height: 160,
              textAlign: "center",
              verticalAlignment: go.Spot.Center,
            },
            new go.Binding("desiredSize", "part", partSizeConverter),
            new go.Binding("text", "name"),
            new go.Binding("font", "part", partFontConverter)
          )
        )
      )
    )
  );
  // for layer 3
  diagram.nodeTemplateMap.add(
    "leaf",

    $(
      go.Node,
      "Spot",
      $(go.Shape, "RoundedRectangle", {
        width: 110,
        height: 180,
        fill: greengrad,
        stroke: "black",
        stretch: go.GraphObject.Fill,
        alignment: go.Spot.TopCenter,
      }),
      $(
        go.TextBlock,
        {
          // font: "bold 13px Helvetica, bold Arial, sans-serif",
          stroke: "black",
          margin: 1,
          // maxLines: 10,
          width: 105,
          height: 180,
          textAlign: "center",
          verticalAlignment: go.Spot.Center,
        },
        new go.Binding("text", "name"),
        new go.Binding("font", "part", partFontConverter)
      )
    )
  );
  // Define a trivial link template with no arrowhead
  diagram.linkTemplate = $(
    go.Link,
    {
      curve: go.Link.Bezier,
      toEndSegmentLength: 30,
      fromEndSegmentLength: 30,
    },
    $(go.Shape, { strokeWidth: 1.5 }) // the link shape, with the default black stroke
  );
  var nodeDataArray = [
    { key: 1, name: "Game-theoretic interactions", part: "F" },
    { key: 2, name: "Unifying different explanations", part: "P" },
    {
      key: 3,
      name: "Extracting the common mechanisms of different methods",
      part: "P",
    },
    {
      key: 4,
      name: "Learning baseline values of Shapley value explanations",
      part: "T",
      category: "middle",
      chapter: 1,
    },
    {
      key: 5,
      name: "Explain interactions between features in a DNN",
      part: "T",
      category: "middle",
      chapter: 2,
    },
    {
      key: 6,
      name: "Explain and unify attribution explanations",
      part: "T",
      category: "middle",
      chapter: 3,
    },
    {
      key: 7,
      name: "Explain the semantic concepts of a DNN",
      part: "T",
      category: "middle",
      chapter: 4,
    },
    {
      key: 8,
      part: "T",
      name: "Discover and explain the representation bottleneck of DNNs",
      category: "middle",
      chapter: 5,
    },
    {
      key: 9,
      name: "Explain the generalization ability",
      part: "T",
      category: "middle",
      chapter: 6,
    },
    {
      key: 10,
      name: "Explain the adversarial transferability",
      part: "T",
      category: "middle",
      chapter: 7,
    },
    {
      key: 11,
      name: "Explain the aesthetic appreciation",
      part: "T",
      category: "middle",
      chapter: 8,
    },
    {
      key: 12,
      name: "Explain the adversarial robustness",
      part: "T",
      category: "middle",
      chapter: 9,
    },
    {
      key: 13,
      name: "Address the theoretical flaws with baseline values of Shapley values",
      category: "leaf",
    },
    {
      key: 14,
      name: "Explain a DNN from interactions between features, instead of the importance of an individual feature",
      category: "leaf",
    },
    {
      key: 15,
      name: "Attribution methods are based on various heuristics, lacking common theoretical mechanisms",
      category: "leaf",
    },
    {
      key: 16,
      name: "Provide a new taxonomy of semantic concepts w.r.t. complexities",
      category: "leaf",
    },
    {
      key: 17,
      name: "Explore the common tendency of feature representations of DNNs",
      category: "leaf",
    },
    {
      key: 18,
      name: "Most techniques strengthening the generalization abilities are heuristic",
      category: "leaf",
    },
    {
      key: 19,
      name: "Current studies to explore factors influencing the transferability are based on experiments",
      category: "leaf",
    },
    {
      key: 20,
      name: "Existing works lack a mathematical modeling for the aesthetic appreciation",
      category: "leaf",
    },
    {
      key: 21,
      name: "Many techniques boosting the robustness are heuristic, whose mechanisms are largely missing",
      category: "leaf",
    },
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

  // Create the model for the hierarchy diagram
  diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}
window.addEventListener("DOMContentLoaded", init);
