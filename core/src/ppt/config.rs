use serde::Deserialize;

#[derive(Debug, Default, Deserialize)]
pub struct TemplateConfig {
    pub title: Option<TextTemplate>,
    pub body: Option<TextTemplate>,
}

#[derive(Debug, Default, Deserialize)]
pub struct TextTemplate {
    pub font: Option<String>,
    pub size: Option<f32>,
    pub color: Option<String>,
    pub position: Option<PositionTemplate>,
}

#[derive(Debug, Default, Deserialize)]
pub struct PositionTemplate {
    pub x: Option<f32>,
    pub y: Option<f32>,
    pub width: Option<f32>,
    pub height: Option<f32>,
}
