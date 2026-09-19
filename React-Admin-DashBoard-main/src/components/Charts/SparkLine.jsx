import React from "react";
import {
  SparklineComponent,
  Inject,
  SparklineTooltip,
} from "@syncfusion/ej2-react-charts";

const SparkLine = ({ id, height, width, color, data, type, currentColor }) => {
  // Validate required props
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div
        style={{
          height: height || "80px",
          width: width || "100%",
          backgroundColor: color || "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        <span style={{ color: "#6b7280", fontSize: "12px" }}>
          No data available
        </span>
      </div>
    );
  }

  try {
    return (
      <SparklineComponent
        id={id || "sparkline-chart"}
        height={height || "80px"}
        width={width || "100%"}
        lineWidth={1}
        valueType="Numeric"
        fill={color || "#03C9D7"}
        border={{ color: currentColor || "#03C9D7", width: 2 }}
        tooltipSettings={{
          visible: true,
          format: "${x} : data ${yval}",
          trackLineSettings: {
            visible: true,
          },
        }}
        markerSettings={{
          visible: ["All"],
          size: 2.5,
          fill: currentColor || "#03C9D7",
        }}
        dataSource={data}
        xName="x"
        yName="yval"
        type={type || "Line"}
      >
        <Inject services={[SparklineTooltip]} />
      </SparklineComponent>
    );
  } catch (error) {
    return (
      <div
        style={{
          height: height || "80px",
          width: width || "100%",
          backgroundColor: color || "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        <span style={{ color: "#6b7280", fontSize: "12px" }}>Chart error</span>
      </div>
    );
  }
};

export default SparkLine;
