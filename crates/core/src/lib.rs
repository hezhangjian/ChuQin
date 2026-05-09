pub const APP_NAME: &str = "ChuQin";

#[derive(Debug, Clone, serde::Serialize)]
pub struct RuntimeInfo {
    pub app_name: &'static str,
    pub version: &'static str,
}

pub fn runtime_info() -> RuntimeInfo {
    RuntimeInfo {
        app_name: APP_NAME,
        version: env!("CARGO_PKG_VERSION"),
    }
}
