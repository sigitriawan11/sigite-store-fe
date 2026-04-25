import { FC } from "react";
import {
  Row,
  Col,
  Form as AntdForm,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Checkbox,
  AutoComplete,
  InputNumber,
  Space,
  Typography,
  Switch,
} from "antd";
import { FormInstance, Rule } from "antd/es/form";
const { Text } = Typography;

type MaybeFn<T> = T | ((values: any) => T);

export type SwitchPropsWithMeta = Omit<
  WithDynamicProps<React.ComponentProps<typeof Switch>>,
  "checked"
> & {
  label?: string;
  key: string;
  description?: React.ReactNode
  rules?: Rule[];
  defaultValue?: boolean;
  hidden?: MaybeFn<boolean>;
  disabled?: MaybeFn<boolean>;
};

type WithDynamicProps<T> = Omit<T, "disabled" | "hidden"> & {
  disabled?: MaybeFn<boolean>;
  hidden?: MaybeFn<boolean>;
};

export type SelectOption = {
  label: string;
  value: string | number;
};

export type InputPropsWithMeta = WithDynamicProps<
  React.ComponentProps<typeof Input>
> & {
  label?: string;
  key: string;
  rules?: Rule[];
  defaultValue?: any;
  type?: "number" | "currency" | "email" | "password" | "password_no_rules" | "phone";
  disabled?: MaybeFn<boolean>;
  hidden?: MaybeFn<boolean>;
};

export type TextPropsWithMeta = Omit<
  WithDynamicProps<React.ComponentProps<typeof Text>>,
  "children"
> & {
  key: string;
  label?: string;
  hidden?: MaybeFn<boolean>;
  children: React.ReactNode;
};
export type ButtonPropsWithMeta = WithDynamicProps<
  React.ComponentProps<typeof Button>
> & {
  label: string;
  key: string;
  disabled?: MaybeFn<boolean>;
  hidden?: MaybeFn<boolean>;
};

export type SelectPropsWithMeta = Omit<
  WithDynamicProps<React.ComponentProps<typeof Select>>,
  "options"
> & {
  label: string;
  key: string;
  options: SelectOption[];
  rules?: Rule[];
  defaultValue?: any;
  disabled?: MaybeFn<boolean>;
  hidden?: MaybeFn<boolean>;
};

export type RadioPropsWithMeta = Omit<
  WithDynamicProps<React.ComponentProps<typeof Radio.Group>>,
  "options"
> & {
  label: string;
  key: string;
  options: SelectOption[];
  rules?: Rule[];
  defaultValue?: any;
  disabled?: MaybeFn<boolean>;
  hidden?: MaybeFn<boolean>;
};

export type CheckboxPropsWithMeta = Omit<
  WithDynamicProps<React.ComponentProps<typeof Checkbox.Group>>,
  "options"
> & {
  label: string;
  key: string;
  options: SelectOption[];
  rules?: Rule[];
  defaultValue?: any;
  disabled?: MaybeFn<boolean>;
  hidden?: MaybeFn<boolean>;
};

export type DatePickerPropsWithMeta = WithDynamicProps<
  React.ComponentProps<typeof DatePicker>
> & {
  label: string;
  key: string;
  rules?: Rule[];
  defaultValue?: any;
  disabled?: MaybeFn<boolean>;
  hidden?: MaybeFn<boolean>;
};

export type AutoCompletePropsWithMeta = Omit<
  WithDynamicProps<React.ComponentProps<typeof AutoComplete>>,
  "options"
> & {
  label?: string;
  key: string;
  options: SelectOption[];
  rules?: Rule[];
  defaultValue?: any;
  disabled?: MaybeFn<boolean>;
  hidden?: MaybeFn<boolean>;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
};

export type FieldConfig = {
  col: number;
  input?: InputPropsWithMeta;
  button?: ButtonPropsWithMeta;
  select?: SelectPropsWithMeta;
  datepicker?: DatePickerPropsWithMeta;
  radio?: RadioPropsWithMeta;
  checkbox?: CheckboxPropsWithMeta;
  autocomplete?: AutoCompletePropsWithMeta;
  text?: TextPropsWithMeta;
  switch?: SwitchPropsWithMeta;
  other?: React.ReactNode;
};

export type FormProps = {
  config: FieldConfig[][];
  form: FormInstance<any>;
  onFinish?: (values: any) => void;
};

export const FormApp: FC<FormProps> = ({ config, form, onFinish }) => {
  const values = AntdForm.useWatch([], form);
  const initialValues = config.flat().reduce(
    (acc, field) => {
      const source =
        field.input ||
        field.select ||
        field.datepicker ||
        field.radio ||
        field.checkbox ||
        field.autocomplete ||
        field.switch;
      if (source?.key) {
        acc[source.key] = source.defaultValue ?? null;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const FUNCTION_PROPS = [
    // state UI
    "disabled",
    "hidden",
    "readOnly",

    // data driven
    "options",

    // display
    "placeholder",
    "label",

    // validation
    "rules",

    // style / layout (optional)
    "style",
    "className",
  ];

  const renderField = (field: FieldConfig, index: string) => {
    const shouldHide = (props: any) => props?.hidden;
    const resolveProps = (props: any, values: any) => {
      if (!props) return props;

      const result: any = {};

      Object.keys(props).forEach((key) => {
        const value = props[key];

        if (typeof value === "function" && FUNCTION_PROPS.includes(key)) {
          result[key] = value(values);
        } else {
          result[key] = value;
        }
      });

      return result;
    };

    if (field.text) {
      const { label, key, children, ...rest } = field.text;
      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;

      return (
        <AntdForm.Item label={label} key={`text-${index}`}>
          <Text {...rest} {...resolvedProps}>{children}</Text>
        </AntdForm.Item>
      );
    }

    if (field.input) {
      const {
        defaultValue,
        label,
        key,
        type,
        addonAfter,
        addonBefore,
        rules,
        ...rest
      } = field.input;

      const hasAddon = addonBefore || addonAfter;

      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;

      if (type === "phone") {
        const baseRules: Rule[] = rules ?? [];
        const phoneRules: Rule[] = [
          {
            pattern: /^(08|62)\d{7,12}$/,
            message: "Telephone number must start with 08 or 62, minimum 9 digits, maximum 14 digits",
          },
          {
            min: 9,
            max: 14,
            message: "Telephone number must be at least 9 digits and a maximum of 14 digits",
          },
        ];
        return (
          <AntdForm.Item label={label} name={key} rules={[...baseRules, ...phoneRules]}>
            <Input
              {...rest}
              {...resolvedProps}
              // Show numeric keyboard on mobile
              inputMode="numeric"
              // On mobile browsers, show telephone pad
              type="tel"
              // Prevent non-digit input on desktop
              onKeyDown={(e) => {
                const allowedKeys = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Home",
                  "End",
                ];
                if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
              }}
              // Strip non-digits on paste
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
                const input = e.currentTarget;
                const start = input.selectionStart ?? 0;
                const end = input.selectionEnd ?? 0;
                const current: string = form.getFieldValue(key) ?? "";
                const next =
                  current.slice(0, start) + pasted + current.slice(end);
                form.setFieldValue(key, next);
              }}
              // Remove spinner arrows (Chrome/Safari/Edge)
              style={{ width: "100%", ...((rest as any).style ?? {}) }}
            />
          </AntdForm.Item>
        );
      }

      if (type === "currency") {
        return (
          <AntdForm.Item label={label} name={key} rules={field.input.rules}>
            {hasAddon ? (
              <Space.Compact style={{ width: "100%" }}>
                {addonBefore && <Space.Addon>{addonBefore}</Space.Addon>}
                <InputNumber
                  {...(rest as React.ComponentProps<typeof InputNumber>)}
                  {...resolvedProps}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  parser={(value) => value?.replace(/\./g, "") ?? ""}
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                    ];
                    if (
                      !/^[0-9]$/.test(e.key) &&
                      !allowedKeys.includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                {addonAfter && <Space.Addon>{addonAfter}</Space.Addon>}
              </Space.Compact>
            ) : (
              <InputNumber
                {...(rest as React.ComponentProps<typeof InputNumber>)}
                {...resolvedProps}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value?.replace(/\./g, "") ?? ""}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ];
                  if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            )}
          </AntdForm.Item>
        );
      } else if (type === "number") {
        const numberRules: Rule[] = (rules ?? []).map((rule: any) => {
          if (rule.pattern && typeof rule.pattern === "string") {
            return { ...rule, pattern: new RegExp(rule.pattern) };
          }
          return rule;
        });
        return (
          <AntdForm.Item label={label} name={key} rules={numberRules}>
            <Input
              {...rest}
              {...resolvedProps}
              inputMode="numeric"
              style={{ width: "100%", ...((rest as any).style ?? {}) }}
              onKeyDown={(e) => {
                const allowedKeys = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Home",
                  "End",
                ];
                if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
                const input = e.currentTarget as HTMLInputElement;
                const start = input.selectionStart ?? 0;
                const end = input.selectionEnd ?? 0;
                const current: string = String(form.getFieldValue(key) ?? "");
                const next = current.slice(0, start) + pasted + current.slice(end);
                form.setFieldValue(key, next);
                // trigger validation after paste
                setTimeout(() => form.validateFields([key]), 0);
              }}
            />
          </AntdForm.Item>
        );
      } else if (type === "email") {
        const rules: Rule[] = field.input.rules ?? [];
        const emailRules: Rule[] = [
          {
            type: "email",
            message: "Enter a valid email address (ex: example@domain.com)",
          },
        ];
        return (
          <AntdForm.Item
            label={label}
            name={key}
            rules={[...rules, ...emailRules]}
          >
            <Input {...rest} {...resolvedProps} />
          </AntdForm.Item>
        );
      } else if (type === "password") {
        const rules: Rule[] = field.input.rules ?? []
        const passRules: Rule[] = [
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
            message:
              "Password must be at least 8 characters and include uppercase, lowercase, and a number",
          }
        ]
        return (
          <AntdForm.Item label={label} name={key} rules={[...rules, ...passRules]}>
            <Input.Password {...rest} {...resolvedProps} />
          </AntdForm.Item>
        );
      } else if (type === "password_no_rules") {
        const rules: Rule[] = field.input.rules ?? []
        return (
          <AntdForm.Item label={label} name={key} rules={[...rules]}>
            <Input.Password {...rest} {...resolvedProps} />
          </AntdForm.Item>
        );
      }

      const final_rules = rules?.length ? rules.map((rule:any) => {
        if (rule.pattern && typeof rule.pattern === 'string') {
          return {
            ...rule,
            pattern: new RegExp(rule.pattern)
          }
        }
        return rule
      }) : []

      return (
        <AntdForm.Item label={label} name={key} rules={final_rules}>
          <Input {...rest} {...resolvedProps} />
        </AntdForm.Item>
      );
    }

    if (field.switch) {
      const { label, key, description, defaultValue, rules, ...rest } = field.switch;
      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;

      return (
        <AntdForm.Item label={label} valuePropName="checked">
          <Space align="center">
            {description && <Text>{description}</Text>}
            <AntdForm.Item name={key} valuePropName="checked" rules={rules} noStyle>
              <Switch {...rest} {...resolvedProps} />
            </AntdForm.Item>
          </Space>
        </AntdForm.Item>
      );
    }

    if (field.select) {
      const { defaultValue, label, key, options, ...rest } = field.select;
      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;
      return (
        <AntdForm.Item label={label} name={key} rules={field.select.rules}>
          <Select {...rest} options={options} {...resolvedProps} />
        </AntdForm.Item>
      );
    }

    if (field.radio) {
      const { defaultValue, label, key, options, ...rest } = field.radio;
      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;
      return (
        <AntdForm.Item label={label} name={key} rules={field.radio.rules}>
          <Radio.Group {...rest} {...resolvedProps}>
            {options.map((opt) => (
              <Radio key={opt.value} value={opt.value}>
                {opt.label}
              </Radio>
            ))}
          </Radio.Group>
        </AntdForm.Item>
      );
    }

    if (field.checkbox) {
      const { defaultValue, label, key, options, ...rest } = field.checkbox;
      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;
      return (
        <AntdForm.Item label={label} name={key} rules={field.checkbox.rules}>
          <Checkbox.Group {...rest} options={options} {...resolvedProps} />
        </AntdForm.Item>
      );
    }

    if (field.datepicker) {
      const { defaultValue, label, key, ...rest } = field.datepicker;
      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;
      return (
        <AntdForm.Item label={label} name={key} rules={field.datepicker.rules}>
          <DatePicker {...rest} style={{ width: "100%" }} {...resolvedProps} />
        </AntdForm.Item>
      );
    }

    if (field.autocomplete) {
      const { defaultValue, label, key, options, addonBefore, addonAfter, ...rest } = field.autocomplete;

      const hasAddon = addonBefore || addonAfter;

      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;
      return (
        <AntdForm.Item
          label={label}
          name={key}
          rules={field.autocomplete.rules}
        >
          {hasAddon ? (
            <Space.Compact style={{ width: "100%" }}>
              {addonBefore && <Space.Addon>{addonBefore}</Space.Addon>}
              <AutoComplete {...rest} options={options} {...resolvedProps} />
              {addonAfter && <Space.Addon>{addonAfter}</Space.Addon>}
            </Space.Compact>
          ) : (
            <AutoComplete {...rest} options={options} {...resolvedProps} />
          )}
        </AntdForm.Item>
      );
    }

    if (field.button) {
      const { defaultValue, label, key, ...rest } = field.button;
      const resolvedProps = resolveProps(rest, values);

      if (shouldHide(resolvedProps)) return null;
      return (
        <AntdForm.Item>
          <Button key={key} block {...rest} {...resolvedProps}>
            {label}
          </Button>
        </AntdForm.Item>
      );
    }

    if (field.other) {
      return (field.other)
    }

    return null;
  };

  return (
    <AntdForm
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      {config.map((row, rowIndex) => (
        <Row gutter={[24, 0]} key={rowIndex} className="w-full!">
          {row.map((field, colIndex) => (
            <Col span={field.col} key={`${rowIndex}-${colIndex}`} className="w-full!">
              {renderField(field, `${rowIndex}-${colIndex}`)}
            </Col>
          ))}
        </Row>
      ))}
    </AntdForm>
  );
};