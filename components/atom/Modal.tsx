import { FC } from "react";
import { Modal, Button, Space, FormInstance } from "antd";

export type ModalConfig = {
  key: string;
  title: string;
  visible: boolean;
  component: FC<any>;
  props?: any;
  form?: FormInstance<any>
  labelOk?: string | null;
  labelCancel?: string | null;
  onOk?: () => void;
  onCancel?: () => void;
};

type Props = {
  modals: ModalConfig[];
};

export const ModalApp: FC<Props> = ({ modals }) => {
  return (
    <>
      {modals.map(
        ({
          key,
          title,
          visible,
          component: Component,
          props,
          labelOk,
          labelCancel,
          onOk,
          onCancel,
        }) => {
          const hideOk = labelOk === null;
          const hideCancel = labelCancel === null;
          const hideAll = hideOk && hideCancel;

          const customFooter = hideAll ? null : (
            <div style={{ textAlign: "center" }}>
              <Space style={{ display: "flex", justifyContent: "center"}}>
                {!hideOk && (
                  <Button type="primary" onClick={onOk}>
                    {labelOk ?? "Yes"}
                  </Button>
                )}
                {!hideCancel && (
                  <Button onClick={onCancel}>
                    {labelCancel ?? "Cancel"}
                  </Button>
                )}
              </Space>
            </div>
          );

          return (
            <Modal
              key={key}
              title={title}
              open={visible}
              footer={customFooter}
              closable={!!onCancel}
              onCancel={onCancel}
            >
              <Component {...props} />
            </Modal>
          );
        }
      )}
    </>
  );
};
