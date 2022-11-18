export interface ZOptions {
  readonly label?: string
  readonly color?: string
}

export interface ZOptionsMethods {
  label(label: string): ZOptionsMethods
  color(color: string): ZOptionsMethods
}
