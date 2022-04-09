/*
 * :Author: Shaobo Wang
 * :Date: 2022-04-08 21:32:17
 * :LastEditors: Shaobo Wang
 * :LastEditTime: 2022-04-09 09:14:00
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
      allowSelect: true,
      allowDrop: false,
      allowMove: false,
      // create a TreeLayout for the family tree
      //   layout: $(go.TreeLayout, {angle:90, nodeSpacing: 5 }),
      layout: $(go.TreeLayout, { nodeSpacing: 5 }),
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
    1: "rgb(46, 182, 44)",
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

  // get tooltip text from the object's data
  function tooltipTextConverter(person) {
    var str = "";
    str += "Born: " + person.birthYear;
    if (person.deathYear !== undefined) str += "\nDied: " + person.deathYear;
    if (person.reign !== undefined) str += "\nReign: " + person.reign;
    return str;
  }

  // define tooltips for nodes
  var tooltiptemplate = $(
    "ToolTip",
    { "Border.fill": "whitesmoke", "Border.stroke": "black" },
    $(
      go.TextBlock,
      {
        font: "bold 8pt Helvetica, bold Arial, sans-serif",
        wrap: go.TextBlock.WrapFit,
        margin: 5,
      },
      new go.Binding("text", "", tooltipTextConverter)
    )
  );

  // define Converters to be used for Bindings
  function partBrushConverter(part) {
    if (part === "F") return bluegrad;
    if (part === "P") return pinkgrad;
    if (part === "T") return yellowgrad;
    return greengrad;
  }

  function partFontConverter(part) {
    if (part === "F") return "18pt Helvetica, bold Arial, sans-serif";
    if (part === "P") return "13pt Helvetica, bold Arial, sans-serif";
    if (part === "T") return "10pt Helvetica,";
    // return "8pt Helvetica, bold Arial, sans-serif";
  }

  // replace the default Node template in the nodeTemplateMap
  myDiagram.nodeTemplate = $(
    go.Node,
    "Auto",
    { deletable: false, toolTip: tooltiptemplate },
    new go.Binding("text", "name"),
    $(
      go.Shape,
      "RoundedRectangle",
      {
        desiredSize: new go.Size(200, 72),
        fill: greengrad,
        margin: 5,
      },
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
          maxSize: 
          new go.Size(200, 150),
          // font: "8pt Helvetica, bold Arial, sans-serif", 
          textAlign: "center" },
        new go.Binding("text", "name"),
        new go.Binding("font", "part", partFontConverter)
      ),

      //   $(go.TextBlock, new go.Binding("text", "kanjiName"))
    )
  );

  // define the Link template
  myDiagram.linkTemplate = $(
    go.Link, // the whole link panel
    { routing: go.Link.Orthogonal, corner: 5, selectable: false },
    $(go.Shape)
  ); // the default black link shape

  // here's the family data
  //   var nodeDataArray = [
  //     {
  //       key: 0,
  //       name: "Osahito",
  //       gender: "M",
  //       fullTitle: "Emperor Kōmei",
  //       kanjiName: "統仁 孝明天皇",
  //       posthumousName: "Komei",
  //       birthYear: "1831",
  //       deathYear: "1867",
  //     },
  //     {
  //       key: 1,
  //       parent: 0,
  //       name: "Matsuhito",
  //       gender: "M",
  //       fullTitle: "Emperor Meiji",
  //       kanjiName: "睦仁 明治天皇",
  //       posthumousName: "Meiji",
  //       birthYear: "1852",
  //       deathYear: "1912",
  //     },
  //     {
  //       key: 2,
  //       parent: 1,
  //       name: "Toshiko",
  //       gender: "F",
  //       fullTitle: "Princess Yasu-no-Miya Toshiko",
  //       birthYear: "1896",
  //       deathYear: "1978",
  //       statusChange:
  //         "In 1947, lost imperial family status due to American abrogation of Japanese nobility",
  //     },
  //     {
  //       key: 3,
  //       parent: 2,
  //       name: "Higashikuni Morihiro",
  //       gender: "M",
  //       fullTitle: "Prince Higashikuni Morihiro",
  //       kanjiName: "東久邇宮 盛厚王",
  //       birthYear: "1916",
  //       deathYear: "1969",
  //       statusChange:
  //         "In 1947, lost imperial family status due to American abrogation of Japanese nobility",
  //     },
  //     { key: 4, parent: 3, name: "See spouse for descendants" },
  //     {
  //       key: 5,
  //       parent: 2,
  //       name: "Moromasa",
  //       gender: "M",
  //       fullTitle: "Prince Moromasa",
  //       kanjiName: "師正王",
  //       birthYear: "1917",
  //       deathYear: "1923",
  //     },
  //     {
  //       key: 6,
  //       parent: 2,
  //       name: "Akitsune",
  //       gender: "M",
  //       fullTitle: "Prince Akitsune",
  //       kanjiName: "彰常王",
  //       birthYear: "1920",
  //       deathYear: "2006",
  //       statusChange:
  //         "In 1947, lost imperial family status due to American abrogation of Japanese nobility",
  //     },
  //     {
  //       key: 7,
  //       parent: 2,
  //       name: "Toshihiko",
  //       gender: "M",
  //       fullTitle: "Prince Toshihiko",
  //       kanjiName: "俊彦王",
  //       birthYear: "1929",
  //       statusChange:
  //         "In 1947, lost imperial family status due to American abrogation of Japanese nobility",
  //     },
  //     {
  //       key: 8,
  //       parent: 1,
  //       name: "Yoshihito",
  //       gender: "M",
  //       fullTitle: "Emperor Taishō",
  //       kanjiName: "嘉仁 大正天皇,",
  //       posthumousName: "Taisho",
  //       birthYear: "1879",
  //       deathYear: "1926",
  //     },
  //     {
  //       key: 9,
  //       parent: 8,
  //       name: "Hirohito",
  //       gender: "M",
  //       fullTitle: "Emperor Showa",
  //       kanjiName: "裕仁 昭和天皇",
  //       posthumousName: "Showa",
  //       birthYear: "1901",
  //       deathYear: "1989",
  //     },
  //     {
  //       key: 10,
  //       parent: 9,
  //       name: "Higashikuni Shigeko",
  //       gender: "F",
  //       spouse: "Higashikuni Morihiro",
  //       spouseKanji: "東久邇宮 盛厚王",
  //       fullTitle: "Princess Shigeko Higashikuni",
  //       kanjiName: "東久邇成子",
  //       birthYear: "1925",
  //       deathYear: "1961",
  //       statusChange:
  //         "In 1947, lost imperial family status due to American abrogation of Japanese nobility",
  //     },
  //     {
  //       key: 11,
  //       parent: 10,
  //       name: "Higashikuni Nobuhiko",
  //       gender: "M",
  //       fullTitle: "Prince Higashikuni Nobuhiko",
  //       kanjiName: "東久邇宮 信彦王",
  //       birthYear: "1945",
  //       statusChange:
  //         "In 1947, lost imperial family status due to American abrogation of Japanese nobility",
  //     },
  //     {
  //       key: 12,
  //       parent: 11,
  //       name: "Higashikuni Yukihiko",
  //       gender: "M",
  //       fullTitle: "No Title",
  //       birthYear: "1974",
  //     },
  //     {
  //       key: 13,
  //       parent: 10,
  //       name: "Higashikuni Fumiko",
  //       gender: "F",
  //       fullTitle: "Princess Higashikuni Fumiko",
  //       kanjiName: "文子女王",
  //       birthYear: "1946",
  //       statusChange:
  //         "In 1947, lost imperial family status due to American abrogation of Japanese nobility",
  //     },
  //     {
  //       key: 14,
  //       parent: 10,
  //       name: "Higashikuni Naohiko",
  //       gender: "M",
  //       fullTitle: "No Title",
  //       kanjiName: "東久邇真彦",
  //       birthYear: "1948",
  //     },
  //     {
  //       key: 15,
  //       parent: 14,
  //       name: "Higashikuni Teruhiko",
  //       gender: "M",
  //       fullTitle: "No Title",
  //     },
  //     {
  //       key: 16,
  //       parent: 14,
  //       name: "Higashikuni Matsuhiko",
  //       gender: "M",
  //       fullTitle: "No Title",
  //     },
  //     {
  //       key: 17,
  //       parent: 10,
  //       name: "Higashikuni Hidehiko",
  //       gender: "M",
  //       fullTitle: "No Title",
  //       kanjiName: "東久邇基博",
  //       birthYear: "1949",
  //     },
  //     {
  //       key: 18,
  //       parent: 10,
  //       name: "Higashikuni Yuko",
  //       gender: "F",
  //       fullTitle: "No Title",
  //       kanjiName: "東久邇優子",
  //       birthYear: "1950",
  //     },
  //     {
  //       key: 19,
  //       parent: 9,
  //       name: "Sachiko",
  //       gender: "F",
  //       fullTitle: "Princess Sachiko",
  //       kanjiName: "久宮祐子",
  //       birthYear: "1927",
  //       deathYear: "1928",
  //     },
  //     {
  //       key: 20,
  //       parent: 9,
  //       name: "Kazuko Takatsukasa",
  //       gender: "F",
  //       fullTitle: "Kazuko, Princess Taka",
  //       kanjiName: "鷹司 和子",
  //       birthYear: "1929",
  //       deathYear: "1989",
  //       statusChange:
  //         "In 1950, lost imperial family status by marrying a commoner",
  //     },
  //     {
  //       key: 21,
  //       parent: 9,
  //       name: "Atsuko Ikeda",
  //       gender: "F",
  //       fullTitle: "Atsuko, Princess Yori",
  //       kanjiName: "池田厚子",
  //       birthYear: "1931",
  //       statusChange:
  //         "In 1952, lost imperial family status by marrying a commoner",
  //     },
  //     {
  //       key: 22,
  //       parent: 9,
  //       name: "Akihito",
  //       gender: "M",
  //       fullTitle: "Reigning Emperor of Japan; Tennō",
  //       kanjiName: "明仁 今上天皇",
  //       posthumousName: "Heisei",
  //       birthYear: "1933",
  //     },
  //   ];

  //   // create the model for the family tree
  //   myDiagram.model = new go.TreeModel(nodeDataArray);
  var nodeDataArray = [
    {
      key: 1,
      part: "F",
      name: "Game-theoretic interactions",
    },
    {
      key: 2,
      part: "P",
      name: "Unifying different explanations",
    },
    {
      key: 3,
      part: "P",
      name: "Extracting the common mechanisms of different methods",
    },
    {
      key: 4,
      part: "T",
      name: "Learning baseline values of Shapley value explanations",
    },
    {
      key: 5,
      part: "T",
      name: "Explain interactions between features in a DNN",
    },
    { key: 6, part: "T", name: "Explain and unify attribution explanations" },
    { key: 7, part: "T", name: "Explain the semantic concepts of a DNN" },
    {
      key: 8,
      part: "T",
      name: "Discover and explain the representation bottleneck of DNNs",
    },
    { key: 9, part: "T", name: "Explain the generalization ability" },
    { key: 10, part: "T", name: "Explain the adversarial transferability" },
    { key: 11, part: "T", name: "Explain the aesthetic appreciation" },
    { key: 12, part: "T", name: "Explain the adversarial robustness" },
    {
      key: 13,
      name: "Address the theoretical flaws with baseline values of Shapley values",
    },
    {
      key: 14,
      name: "Explain a DNN from interactions between features, instead of the importance of an individual feature",
    },
    {
      key: 15,
      name: "Attribution methods are based on various heuristics, lacking common theoretical mechanisms",
    },
    {
      key: 16,
      name: "Provide a new taxonomy of semantic concepts w.r.t. complexities",
    },
    {
      key: 17,
      name: "Explore the common tendency of feature representations of DNNs",
    },
    {
      key: 18,
      name: "Most techniques strengthening the generalization abilities are heuristic",
    },
    {
      key: 19,
      name: "Current studies of boosting adversarial transferability are mainly based on heuristics and observasions",
    },
    {
      key: 20,
      name: "Existing works lack a  mathematical modeling for the aesthetic appreciation",
    },
    {
      key: 21,
      name: "The essence of adversarial attack and robustness is still unclear",
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
