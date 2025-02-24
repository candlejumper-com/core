// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/**
 * AnyChart is lightweight robust charting library with great API and Docs, that works with your stack and has tons of chart types and features.
 *
 * Theme: darkEarth
 * Version: 2.0.0 (2019-04-26)
 * License: https://www.anychart.com/buy/
 * Contact: sales@anychart.com
 * Copyright: AnyChart.com 2019. All rights reserved.
 */
 (function() {
  "use strict";

  function a() {
    return this.sourceColor;
  }
  function b() {
    return window.anychart.color.setOpacity(this.sourceColor, 0.6, !0);
  }
  function c() {
    return window.anychart.color.darken(this.sourceColor);
  }
  function d() {
    return window.anychart.color.lighten(this.sourceColor);
  }
  const f = {
    palette: {
      type: "distinct",
      items: "#827717 #c77532 #998675 #6b617b #c69c6d #d29b9b #879872 #16685d #57a7b1 #bdbdbd".split(
        " "
      )
    },
    defaultOrdinalColorScale: {
      autoColors: function(e) {
        return window.anychart.color.blendedHueProgression(
          "#827717",
          "#c77532",
          e
        );
      }
    },
    defaultLinearColorScale: { colors: ["#827717", "#c77532"] },
    defaultFontSettings: { fontColor: "#888888" },
    defaultBackground: {
      fill: "rgb(66, 66, 66)",
      stroke: null,
      cornerType: "round",
      corners: 0
    },
    defaultAxis: {
      stroke: "#636363 0.6",
      ticks: { stroke: "#636363 0.6" },
      minorTicks: { stroke: "#42484d 0.6" }
    },
    defaultGridSettings: { stroke: "#636363 0.6" },
    defaultMinorGridSettings: { stroke: "#42484d 0.6" },
    defaultSeparator: { fill: "#42484d 0.6" },
    defaultTooltip: {
      background: { stroke: "1.5 #212121", corners: 5 },
      padding: { top: 8, right: 15, bottom: 10, left: 15 }
    },
    defaultColorRange: {
      stroke: "#616161",
      ticks: { stroke: "#616161", position: "outside", length: 7, enabled: !0 },
      minorTicks: {
        stroke: "#616161",
        position: "outside",
        length: 5,
        enabled: !0
      },
      marker: {
        padding: { top: 3, right: 3, bottom: 3, left: 3 },
        fill: "#616161"
      }
    },
    defaultScroller: {
      fill: "#424242",
      selectedFill: "#616161",
      thumbs: {
        fill: "#757575",
        stroke: "#424242",
        hovered: { fill: "#bdbdbd", stroke: "#616161" }
      }
    },
    chart: {
      defaultSeriesSettings: {
        base: {
          hovered: { fill: "#bdbdbd" },
          selected: {
            fill: "red",
            stroke: "1.5 #212121",
            markers: { stroke: "1.5 #fafafa" }
          }
        },
        lineLike: { selected: { stroke: "3 red" } },
        areaLike: { selected: { stroke: "3 #bdbdbd" } },
        marker: { selected: { stroke: "1.5 #bdbdbd" } },
        candlestick: {
          normal: {
            risingFill: "blue",
            risingStroke: "#827717",
            fallingFill: "red",
            fallingStroke: "#c77532"
          },
          hovered: {
            risingFill: d,
            risingStroke: c,
            fallingFill: d,
            fallingStroke: c
          },
          selected: {
            risingStroke: "3 #827717",
            fallingStroke: "3 #c77532",
            risingFill: "#333333 0.85",
            fallingFill: "#333333 0.85"
          }
        },
        ohlc: {
          normal: { risingStroke: "#827717", fallingStroke: "#c77532" },
          hovered: { risingStroke: c, fallingStroke: c },
          selected: { risingStroke: "3 #827717", fallingStroke: "3 #c77532" }
        }
      },
      background: {
        stroke: null
      },
      yAxis: {
        orientation: 'right'
      },
      padding: { top: 20, right: 55, bottom: 15, left: 0 }
    },
    cartesianBase: {
      defaultSeriesSettings: {
        box: {
          selected: {
            medianStroke: "#bdbdbd",
            stemStroke: "#bdbdbd",
            whiskerStroke: "#bdbdbd",
            outlierMarkers: {
              enabled: null,
              size: 4,
              fill: "#bdbdbd",
              stroke: "#bdbdbd"
            }
          }
        }
      }
    },
    pieFunnelPyramidBase: {
      normal: { labels: { fontColor: null } },
      selected: { stroke: "1.5 #bdbdbd" },
      connectorStroke: "#636363",
      outsideLabels: { autoColor: "#888888" },
      insideLabels: { autoColor: "#212121" }
    },
    map: {
      unboundRegions: { enabled: !0, fill: "#424242", stroke: "#616161" },
      defaultSeriesSettings: {
        base: {
          normal: { stroke: d, labels: { fontColor: "#212121" } },
          hovered: { fill: "#bdbdbd" },
          selected: { fill: "#e0e0e0", stroke: "1.5 #212121" }
        },
        connector: {
          normal: { markers: { stroke: "1.5 #424242" } },
          hovered: { markers: { stroke: "1.5 #424242" } },
          selected: {
            stroke: "1.5 #fafafa",
            markers: { fill: "#fafafa", stroke: "1.5 #424242" }
          }
        },
        bubble: { normal: { stroke: d } },
        marker: { normal: { labels: { fontColor: "#888888" } } }
      }
    },
    sparkline: {
      padding: 0,
      background: { stroke: "#2b2b2b" },
      defaultSeriesSettings: {
        area: { stroke: "1.5 #827717", fill: "#827717 0.5" },
        column: { fill: "blue", negativeFill: "#c77532" },
        line: { stroke: "1.5 #827717" },
        winLoss: { fill: "#827717", negativeFill: "#c77532" }
      }
    },
    bullet: {
      background: { stroke: "#2b2b2b" },
      defaultMarkerSettings: { fill: "#827717", stroke: "2 #827717" },
      padding: { top: 5, right: 10, bottom: 5, left: 10 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      rangePalette: {
        items: ["#565656", "#4B4B4B", "#414141", "#383838", "#303030"]
      }
    },
    heatMap: {
      normal: { stroke: "1 #2b2b2b", labels: { fontColor: "#212121" } },
      hovered: { stroke: "1.5 #2b2b2b" },
      selected: { stroke: "2 #bdbdbd" }
    },
    // treeMap: {
    //   normal: {
    //     headers: {
    //       background: { enabled: !0, fill: "#424242", stroke: "#616161" }
    //     },
    //     labels: { fontColor: "#212121" },
    //     stroke: "#616161"
    //   },
    //   hovered: {
    //     headers: {
    //       fontColor: "#888888",
    //       background: { fill: "#616161", stroke: "#616161" }
    //     }
    //   },
    //   selected: { labels: { fontColor: "#fafafa" }, stroke: "2 #eceff1" }
    // },
    // stock: {
    //   padding: [20, 30, 20, 60],
    //   defaultPlotSettings: {
    //     xAxis: { background: { fill: "#424242 0.3", stroke: "#636363 0.6" } }
    //   },
    //   scroller: {
    //     fill: "none",
    //     selectedFill: "#424242 0.3",
    //     outlineStroke: "#636363 0.6",
    //     defaultSeriesSettings: {
    //       base: { selected: { stroke: b, fill: b } },
    //       lineLike: { selected: { stroke: b } },
    //       areaLike: { selected: { stroke: b, fill: b } },
    //       marker: { selected: { stroke: b } },
    //       candlestick: {
    //         normal: {
    //           risingFill: "#999 0.6",
    //           risingStroke: "#999 0.6",
    //           fallingFill: "#999 0.6",
    //           fallingStroke: "#999 0.6"
    //         },
    //         selected: {
    //           risingStroke: b,
    //           fallingStroke: b,
    //           risingFill: b,
    //           fallingFill: b
    //         }
    //       },
    //       ohlc: {
    //         normal: { risingStroke: "#999 0.6", fallingStroke: "#999 0.6" },
    //         selected: { risingStroke: a, fallingStroke: a }
    //       }
    //     }
    //   }
    // }
  };
  window.anychart = window.anychart || {};
  window.anychart.theme = window.anychart.theme || {};
  window.anychart.theme.darkCustom = f;
})();
