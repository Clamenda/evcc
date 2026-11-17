import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vite-plus/test";
import GroupChart from "./GroupChart.vue";
import { PERIODS } from "../Sessions/types";

vi.mock("@/mixins/echartsChart", () => ({ default: {} }));

describe("temperature tooltip", () => {
  test.each([-5, 0, 12])("shows %s °C without energy data", (temperature) => {
    const wrapper = mount(GroupChart, {
      props: {
        group: "meter",
        color: "#888888",
        period: PERIODS.DAY,
        from: new Date(2026, 10, 17),
        to: new Date(2026, 10, 18),
        singleValue: true,
        series: [{ group: "meter", title: "Home", data: [] }],
        temperatures: [temperature, null],
      },
      global: {
        mocks: { $t: (key: string) => key, $i18n: { locale: "de" } },
      },
    });
    const { formatter } = (
      wrapper.vm.chartOption as {
        tooltip: {
          formatter: (
            params: { value: number | null; seriesId: string; dataIndex: number }[]
          ) => string;
        };
      }
    ).tooltip;
    const params = (dataIndex: number, value: number | null = null) => [
      { value, seriesId: "entity-0-0-energy", dataIndex },
    ];

    const tooltip = formatter(params(0));
    expect(tooltip).toContain("energy.temperature.label");
    expect(tooltip).toContain(wrapper.vm.fmtTemperature(temperature));
    expect(formatter(params(1))).toBe("");
    expect(formatter(params(0, 1))).toContain("energy.temperature.label");
    expect(formatter(params(1, 1))).not.toBe("");
    expect(formatter([])).toBe("");
    wrapper.unmount();
  });
});
