{{- define "edenfield.name" -}}
{{- default .Chart.Name .Values.nameOverride -}}
{{- end -}}

{{- define "edenfield.fullname" -}}
{{- printf "%s-%s" (include "edenfield.name" .) .Release.Name -}}
{{- end -}}
