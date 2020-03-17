const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const net = require('net');
const Timer = require('../../util/timer');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgaWQ9InN2ZzgiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDEwLjU4MzMzMyAxMC41ODMzMzQiCiAgIGhlaWdodD0iNDAiCiAgIHdpZHRoPSI0MCIKICAgc29kaXBvZGk6ZG9jbmFtZT0iNDB4NDAuc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjMgKDI0MDU1NDYsIDIwMTgtMDMtMTEpIj4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE1MTIiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODgxIgogICAgIGlkPSJuYW1lZHZpZXcxMCIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC10ZXh0LWJhc2VsaW5lPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSI1LjkiCiAgICAgaW5rc2NhcGU6Y3g9Ii0xNS43NjI3MTIiCiAgICAgaW5rc2NhcGU6Y3k9IjIwIgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ic3ZnOCIgLz4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE1Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlkPSJ0ZXh0ODE3IgogICAgIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYztmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo4LjQ2NjY2NjIycHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTonUGFsYWNlIFNjcmlwdCBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonUGFsYWNlIFNjcmlwdCBNVCwgSXRhbGljJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtZmVhdHVyZS1zZXR0aW5nczpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDtsZXR0ZXItc3BhY2luZzowcHg7d29yZC1zcGFjaW5nOjBweDt3cml0aW5nLW1vZGU6bHItdGI7dGV4dC1hbmNob3I6c3RhcnQ7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgIGFyaWEtbGFiZWw9IlkiCiAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC45ODQ0MjY0NywwLDAsMC45ODQ0MjY0NywtNjUuMTk2MDcxLC0xMTkuMjUwMzQpIj4KICAgIDxwYXRoCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgaWQ9InBhdGg0NTIwIgogICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6aXRhbGljO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOjguNDY2NjY2MjJweDtmb250LWZhbWlseTonUGFsYWNlIFNjcmlwdCBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonUGFsYWNlIFNjcmlwdCBNVCwgSXRhbGljJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtZmVhdHVyZS1zZXR0aW5nczpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDt3cml0aW5nLW1vZGU6bHItdGI7dGV4dC1hbmNob3I6c3RhcnQ7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzIiCiAgICAgICBkPSJtIDY5Ljc1MTA1NCwxMjMuNDQ1OTQgMC4wNjIwMSwwLjAwOCBxIC0wLjA2MjAxLDAuMjY4NzIgLTAuMzIyNDYxLDAuNTY2MzcgLTAuMjYwNDQ5LDAuMjkzNTMgLTAuNjM2NjU0LDAuNDgzNjkgLTAuMzcyMDcsMC4xODYwNCAtMC43NDQxNCwwLjE4NjA0IC0wLjE1NzA5NywwIC0wLjI4OTM4OCwtMC4wODY4IC0wLjEzMjI5MiwtMC4wOTA5IC0wLjEzMjI5MiwtMC4zMDE3OSAwLC0wLjMxODMyIDAuMjg1MjU0LC0wLjY1MzE5IDAuMjg1MjU0LC0wLjMzNDg2IDAuNzI3NjA0LC0wLjU0OTgzIDAuNDQ2NDg1LC0wLjIxOTExIDAuODgwNTY3LC0wLjIxOTExIDAuNzE5MzM1LDAgMC43MTkzMzUsMC42NDkwNSAwLDAuMjAyNTggLTAuMDc0NDEsMC40MDUxNSAtMC4wNzAyOCwwLjE5ODQzIC0wLjIyNzM3NiwwLjQxNzU0IC0wLjE1Mjk2MiwwLjIxOTExIC0wLjQzNDA4MiwwLjUyNTAzIGwgLTAuMTYxMjMsMC4xNzc3NyBxIC0wLjE2OTQ5OSwwLjE2OTUgLTAuMTY5NDk5LDAuMTY5NSAtMC40MzQwODIsMC40NTA2MiAtMC42MTE4NDksMC42NjU1OSAtMC4xNzM2MzMsMC4yMTQ5OCAtMC4xNzM2MzMsMC4zMzA3MyAwLDAuMDc4NSAwLjA2NjE1LDAuMTQwNTYgMC4wNjYxNSwwLjA1NzkgMC4xODYwMzUsMC4wNTc5IDAuMzEwMDU5LDAgMC42NjE0NTgsLTAuMTk0MyAwLjM1NTUzNCwtMC4xOTQzMSAwLjY1NzMyNSwtMC40NjMwMiAwLjMwNTkyNCwtMC4yNjg3MiAwLjQ5NjA5MywtMC40ODc4MyBsIDEuNzk0MjA2LC0xLjk4ODUxIGggMC4zNTU1MzQgbCAtMi4zMTA5NywyLjYxNjkgcSAtMC41MzMzMDEsMC42MDM1OCAtMC45MzAxNzYsMC45NjMyNCAtMC4zOTY4NzUsMC4zNTk2NyAtMC44MTAyODYsMC41NTgxMSAtMC40MDkyNzgsMC4xOTQzIC0wLjg1OTg5NiwwLjE5NDMgLTAuMjMxNTEsMCAtMC40MTM0MTEsLTAuMDY2MSAtMC4xODE5MDEsLTAuMDcwMyAtMC4yODExMiwtMC4xOTg0NCAtMC4wOTkyMiwtMC4xMjgxNiAtMC4wOTkyMiwtMC4yOTM1MiAwLC0wLjE0ODgzIDAuMDc0NDEsLTAuMjM1NjUgMC4wNzQ0MSwtMC4wODY4IDAuMjEwODQsLTAuMDg2OCAwLjE1Mjk2MiwwIDAuMTUyOTYyLDAuMTM2NDIgMCwwLjEyODE2IC0wLjEzNjQyNiwwLjEyODE2IC0wLjEwMzM1MiwwIC0wLjE0NDY5NCwtMC4xNDQ2OSAtMC4wNDEzNCwwLjAxMjQgLTAuMDcwMjgsMC4wNzQ0IC0wLjAyODk0LDAuMDYyIC0wLjAyODk0LDAuMTI4MTYgMCwwLjIyMzI0IDAuMjEwODM5LDAuMzYzOCAwLjIxMDg0LDAuMTM2NDMgMC41MjUwMzMsMC4xMzY0MyAwLjQwOTI3NywwIDAuNzczMDc5LC0wLjE4MTkxIDAuMzY3OTM3LC0wLjE4MTkgMC42Njk3MjcsLTAuNDc1NDIgMC4zMDU5MjQsLTAuMjk3NjYgMC42MDc3MTUsLTAuNjgyMTMgMC4zMDE3OSwtMC4zODQ0NyAwLjU0OTgzNywtMC43MDI4IC0wLjQ2NzE1NSwwLjUyNTA0IC0wLjkwOTUwNSwwLjc0NDE0IC0wLjQ0MjM1LDAuMjE0OTggLTAuNzIzNDcsMC4yMTQ5OCAtMC4zMzA3MjksMCAtMC4zMzA3MjksLTAuMjg5MzkgMCwtMC4yMzk3OCAwLjE5NDMwMywtMC41NzQ2NCAwLjE5NDMwMywtMC4zMzkgMC44OTcxMDMsLTEuMDQxOCAwLjQwMTAwOSwtMC40MDEwMSAwLjU2NjM3MywtMC42NzM4NiAwLjE2OTQ5OSwtMC4yNzI4NSAwLjE2OTQ5OSwtMC41MDQzNiAwLC0wLjIwNjcxIC0wLjE2NTM2NCwtMC4zMzA3MyAtMC4xNjUzNjUsLTAuMTI0MDIgLTAuNDI1ODE0LC0wLjEyNDAyIC0wLjQ3OTU1NywwIC0wLjkxNzc3NCwwLjIyNzM3IC0wLjQzODIxNiwwLjIyMzI0IC0wLjcwMjc5OSwwLjU0NTcgLTAuMjYwNDQ5LDAuMzIyNDcgLTAuMjYwNDQ5LDAuNTgyOTEgMCwwLjE1NzEgMC4xMDMzNTMsMC4yNDgwNSAwLjEwMzM1MiwwLjA4NjggMC4yNjg3MTcsMC4wODY4IDAuMzgwMzM5LDAgMC43Mjc2MDQsLTAuMTgxOSAwLjM1MTQsLTAuMTg2MDQgMC41OTUzMTMsLTAuNDcxMjkgMC4yNDgwNDcsLTAuMjg5MzkgMC4zMTAwNTgsLTAuNTI5MTcgeiIgLz4KICA8L2c+CiAgPGcKICAgICBpZD0idGV4dDgyMSIKICAgICBzdHlsZT0iZm9udC1zdHlsZTppdGFsaWM7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6OC40NjY2NjYyMnB4O2xpbmUtaGVpZ2h0OjEuMjU7Zm9udC1mYW1pbHk6J1BhbGFjZSBTY3JpcHQgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1BhbGFjZSBTY3JpcHQgTVQsIEl0YWxpYyc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LWZlYXR1cmUtc2V0dGluZ3M6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7bGV0dGVyLXNwYWNpbmc6MHB4O3dvcmQtc3BhY2luZzowcHg7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4yNjQ1ODMzMiIKICAgICBhcmlhLWxhYmVsPSJUIgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuOTg0NDI2NDcsMCwwLDAuOTg0NDI2NDcsLTY1LjE5NjA3MSwtMTE5LjI1MDM0KSI+CiAgICA8cGF0aAogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIGlkPSJwYXRoNDUyMyIKICAgICAgIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYztmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo4LjQ2NjY2NjIycHg7Zm9udC1mYW1pbHk6J1BhbGFjZSBTY3JpcHQgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1BhbGFjZSBTY3JpcHQgTVQsIEl0YWxpYyc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LWZlYXR1cmUtc2V0dGluZ3M6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgICAgZD0ibSA3Mi45NDc4OCwxMjYuMTgwNzkgaCAwLjA1Nzg4IHEgLTAuMzM0ODYzLDAuNjc4IC0wLjc2MDY3NywxLjAxNyAtMC40MjU4MTQsMC4zMzg5OSAtMC43NDQxNDEsMC40MjU4MSAtMC4zMTQxOTIsMC4wODY4IC0wLjQ3NTQyMywwLjA4NjggLTAuMzE0MTkzLDAgLTAuNDk2MDk0LC0wLjE1Mjk3IC0wLjE4MTkwMSwtMC4xNTI5NiAtMC4xODE5MDEsLTAuNDEzNDEgMCwtMC4yMjMyNCAwLjE1Mjk2MywtMC41MDAyMyAwLjE1NzA5NiwtMC4yODExMiAwLjQ3OTU1NywtMC41Mzc0MyAwLjMyNjU5NSwtMC4yNjA0NSAwLjgzNTA5MSwtMC40MjU4MSAwLjUxMjYzLC0wLjE2OTUgMS4xOTg4OTMsLTAuMTY5NSAwLjQ3NTQyMywwIDEuMjQ0MzY5LDAuMDc0NCAwLjcwNjkzMywwLjA3MDMgMS4wNjY2MDEsMC4wNzAzIDAuMzUxNCwwIDAuNTg3MDQ0LC0wLjA0MTMgMC4yMzU2NDUsLTAuMDQxMyAwLjMzMDcyOSwtMC4xMTE2MiBoIDAuMDc0NDEgcSAtMC4xNjUzNjQsMC4xNDg4MyAtMC41NDk4MzcsMC4yMzk3OCAtMC4zODQ0NzIsMC4wOTA5IC0wLjY4NjI2MywwLjA5MDkgLTAuMTY1MzY0LDAgLTAuOTA1MzcxLC0wLjExMTYyIC0xLjA1ODMzMywtMC4xNTI5NyAtMS4zMzk0NTMsLTAuMTUyOTcgLTAuNTQ1NzAzLDAgLTEuMDA4NzI0LDAuMTUyOTcgLTAuNDYzMDIxLDAuMTQ4ODIgLTAuNzg1NDgxLDAuNDAxMDEgLTAuMzE4MzI3LDAuMjQ4MDQgLTAuNDgzNjkyLDAuNTIwODkgLTAuMTYxMjMsMC4yNjg3MiAtMC4xNjEyMywwLjUwODUgMCwwLjIzMTUxIDAuMTY1MzY0LDAuMzcyMDcgMC4xNjk0OTksMC4xMzY0MyAwLjQzODIxNiwwLjEzNjQzIDAuMjA2NzA2LDAgMC40NzU0MjQsLTAuMDk1MSAwLjI3Mjg1MSwtMC4wOTkyIDAuNTM3NDM0LC0wLjI4MTEyIDAuMjY4NzE4LC0wLjE4NjAzIDAuNTIwODk5LC0wLjQ3NTQyIDAuMjUyMTgxLC0wLjI4OTM5IDAuNDEzNDExLC0wLjYyODM5IHogbSAtMC43OTc4ODQsMS43Nzc2NyAwLjExMTYyMSwtMC4xNTI5NiBxIDEuMDIxMTI3LC0xLjQyNjI3IDIuMDkxODYyLC0xLjk0NzE3IGwgMC4wNDEzNCwwLjAzMzEgcSAtMC4zNzIwNywwLjE5NDMgLTAuNjY1NTkyLDAuNDE3NTQgLTAuMjg5Mzg4LDAuMjE5MTEgLTAuNTI1MDMzLDAuNTA0MzYgLTAuMjMxNTEsMC4yODExMiAtMC40MjU4MTMsMC42MjgzOSAtMC4zNTU1MzQsMC42MzY2NSAtMC41NDU3MDMsMC45MzQzMSAtMC4xOTAxNywwLjI5MzUyIC0wLjM5Mjc0MSwwLjUyMDkgLTAuMjgxMTIsMC4zMTAwNiAtMC42MjQyNTIsMC41NTgxIC0wLjMzODk5NywwLjI0ODA1IC0wLjY4NjI2MywwLjQwNTE1IC0wLjM0NzI2NSwwLjE1NzA5IC0wLjczMTczOCwwLjIzOTc3IC0wLjM4MDMzOCwwLjA4MjcgLTAuNzUyNDA5LDAuMDgyNyAtMC40OTE5NTksMCAtMC43MTkzMzYsLTAuMTQ0NyAtMC4yMjMyNDIsLTAuMTQ4ODMgLTAuMjIzMjQyLC0wLjM3MjA3IDAsLTAuMTQwNTYgMC4wNzg1NSwtMC4yMjczNyAwLjA3ODU1LC0wLjA5MDkgMC4xODYwMzYsLTAuMDkwOSAwLjE4NjAzNSwwIDAuMTg2MDM1LDAuMTYxMjMgMCwwLjA1MzcgLTAuMDQxMzQsMC4wOTkyIC0wLjAzNzIxLDAuMDQxMyAtMC4wOTUwOCwwLjA0MTMgLTAuMTk0MzAzLDAgLTAuMTI4MTU4LC0wLjIyNzM4IC0wLjA3MDI4LDAuMDQxMyAtMC4wOTkyMiwwLjA5NTEgLTAuMDI0ODEsMC4wNTM4IC0wLjAyNDgxLDAuMTQwNTYgMCwwLjE5ODQ0IDAuMjE5MTA4LDAuMzM0ODcgMC4yMjMyNDIsMC4xMzIyOSAwLjYyMDExNywwLjEzMjI5IDAuNTk5NDQ3LDAgMS4xMjg2MTMsLTAuMjAyNTcgMC41MjkxNjcsLTAuMjAyNTcgMC43OTc4ODQsLTAuNDY3MTYgMC4xNjEyMzEsLTAuMTUyOTYgMC4yOTc2NTcsLTAuMzAxNzkgMC4xMzY0MjUsLTAuMTUyOTYgMC4zNjM4MDIsLTAuNDQyMzUgMC4yMjczNzYsLTAuMjg5MzkgMC41NTgxMDUsLTAuNzUyNDEgeiIgLz4KICA8L2c+Cjwvc3ZnPgo=';

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgaWQ9InN2ZzgiCiAgIHZlcnNpb249IjEuMSIKICAgdmlld0JveD0iMCAwIDEwLjU4MzMzMyAxMC41ODMzMzQiCiAgIGhlaWdodD0iNDAiCiAgIHdpZHRoPSI0MCIKICAgc29kaXBvZGk6ZG9jbmFtZT0iNDB4NDAuc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjMgKDI0MDU1NDYsIDIwMTgtMDMtMTEpIj4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE1MTIiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODgxIgogICAgIGlkPSJuYW1lZHZpZXcxMCIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6c25hcC10ZXh0LWJhc2VsaW5lPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSI1LjkiCiAgICAgaW5rc2NhcGU6Y3g9Ii0xNS43NjI3MTIiCiAgICAgaW5rc2NhcGU6Y3k9IjIwIgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ic3ZnOCIgLz4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE1Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlkPSJ0ZXh0ODE3IgogICAgIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYztmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo4LjQ2NjY2NjIycHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTonUGFsYWNlIFNjcmlwdCBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonUGFsYWNlIFNjcmlwdCBNVCwgSXRhbGljJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtZmVhdHVyZS1zZXR0aW5nczpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDtsZXR0ZXItc3BhY2luZzowcHg7d29yZC1zcGFjaW5nOjBweDt3cml0aW5nLW1vZGU6bHItdGI7dGV4dC1hbmNob3I6c3RhcnQ7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgIGFyaWEtbGFiZWw9IlkiCiAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC45ODQ0MjY0NywwLDAsMC45ODQ0MjY0NywtNjUuMTk2MDcxLC0xMTkuMjUwMzQpIj4KICAgIDxwYXRoCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgaWQ9InBhdGg0NTIwIgogICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6aXRhbGljO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOjguNDY2NjY2MjJweDtmb250LWZhbWlseTonUGFsYWNlIFNjcmlwdCBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonUGFsYWNlIFNjcmlwdCBNVCwgSXRhbGljJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtZmVhdHVyZS1zZXR0aW5nczpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDt3cml0aW5nLW1vZGU6bHItdGI7dGV4dC1hbmNob3I6c3RhcnQ7c3Ryb2tlLXdpZHRoOjAuMjY0NTgzMzIiCiAgICAgICBkPSJtIDY5Ljc1MTA1NCwxMjMuNDQ1OTQgMC4wNjIwMSwwLjAwOCBxIC0wLjA2MjAxLDAuMjY4NzIgLTAuMzIyNDYxLDAuNTY2MzcgLTAuMjYwNDQ5LDAuMjkzNTMgLTAuNjM2NjU0LDAuNDgzNjkgLTAuMzcyMDcsMC4xODYwNCAtMC43NDQxNCwwLjE4NjA0IC0wLjE1NzA5NywwIC0wLjI4OTM4OCwtMC4wODY4IC0wLjEzMjI5MiwtMC4wOTA5IC0wLjEzMjI5MiwtMC4zMDE3OSAwLC0wLjMxODMyIDAuMjg1MjU0LC0wLjY1MzE5IDAuMjg1MjU0LC0wLjMzNDg2IDAuNzI3NjA0LC0wLjU0OTgzIDAuNDQ2NDg1LC0wLjIxOTExIDAuODgwNTY3LC0wLjIxOTExIDAuNzE5MzM1LDAgMC43MTkzMzUsMC42NDkwNSAwLDAuMjAyNTggLTAuMDc0NDEsMC40MDUxNSAtMC4wNzAyOCwwLjE5ODQzIC0wLjIyNzM3NiwwLjQxNzU0IC0wLjE1Mjk2MiwwLjIxOTExIC0wLjQzNDA4MiwwLjUyNTAzIGwgLTAuMTYxMjMsMC4xNzc3NyBxIC0wLjE2OTQ5OSwwLjE2OTUgLTAuMTY5NDk5LDAuMTY5NSAtMC40MzQwODIsMC40NTA2MiAtMC42MTE4NDksMC42NjU1OSAtMC4xNzM2MzMsMC4yMTQ5OCAtMC4xNzM2MzMsMC4zMzA3MyAwLDAuMDc4NSAwLjA2NjE1LDAuMTQwNTYgMC4wNjYxNSwwLjA1NzkgMC4xODYwMzUsMC4wNTc5IDAuMzEwMDU5LDAgMC42NjE0NTgsLTAuMTk0MyAwLjM1NTUzNCwtMC4xOTQzMSAwLjY1NzMyNSwtMC40NjMwMiAwLjMwNTkyNCwtMC4yNjg3MiAwLjQ5NjA5MywtMC40ODc4MyBsIDEuNzk0MjA2LC0xLjk4ODUxIGggMC4zNTU1MzQgbCAtMi4zMTA5NywyLjYxNjkgcSAtMC41MzMzMDEsMC42MDM1OCAtMC45MzAxNzYsMC45NjMyNCAtMC4zOTY4NzUsMC4zNTk2NyAtMC44MTAyODYsMC41NTgxMSAtMC40MDkyNzgsMC4xOTQzIC0wLjg1OTg5NiwwLjE5NDMgLTAuMjMxNTEsMCAtMC40MTM0MTEsLTAuMDY2MSAtMC4xODE5MDEsLTAuMDcwMyAtMC4yODExMiwtMC4xOTg0NCAtMC4wOTkyMiwtMC4xMjgxNiAtMC4wOTkyMiwtMC4yOTM1MiAwLC0wLjE0ODgzIDAuMDc0NDEsLTAuMjM1NjUgMC4wNzQ0MSwtMC4wODY4IDAuMjEwODQsLTAuMDg2OCAwLjE1Mjk2MiwwIDAuMTUyOTYyLDAuMTM2NDIgMCwwLjEyODE2IC0wLjEzNjQyNiwwLjEyODE2IC0wLjEwMzM1MiwwIC0wLjE0NDY5NCwtMC4xNDQ2OSAtMC4wNDEzNCwwLjAxMjQgLTAuMDcwMjgsMC4wNzQ0IC0wLjAyODk0LDAuMDYyIC0wLjAyODk0LDAuMTI4MTYgMCwwLjIyMzI0IDAuMjEwODM5LDAuMzYzOCAwLjIxMDg0LDAuMTM2NDMgMC41MjUwMzMsMC4xMzY0MyAwLjQwOTI3NywwIDAuNzczMDc5LC0wLjE4MTkxIDAuMzY3OTM3LC0wLjE4MTkgMC42Njk3MjcsLTAuNDc1NDIgMC4zMDU5MjQsLTAuMjk3NjYgMC42MDc3MTUsLTAuNjgyMTMgMC4zMDE3OSwtMC4zODQ0NyAwLjU0OTgzNywtMC43MDI4IC0wLjQ2NzE1NSwwLjUyNTA0IC0wLjkwOTUwNSwwLjc0NDE0IC0wLjQ0MjM1LDAuMjE0OTggLTAuNzIzNDcsMC4yMTQ5OCAtMC4zMzA3MjksMCAtMC4zMzA3MjksLTAuMjg5MzkgMCwtMC4yMzk3OCAwLjE5NDMwMywtMC41NzQ2NCAwLjE5NDMwMywtMC4zMzkgMC44OTcxMDMsLTEuMDQxOCAwLjQwMTAwOSwtMC40MDEwMSAwLjU2NjM3MywtMC42NzM4NiAwLjE2OTQ5OSwtMC4yNzI4NSAwLjE2OTQ5OSwtMC41MDQzNiAwLC0wLjIwNjcxIC0wLjE2NTM2NCwtMC4zMzA3MyAtMC4xNjUzNjUsLTAuMTI0MDIgLTAuNDI1ODE0LC0wLjEyNDAyIC0wLjQ3OTU1NywwIC0wLjkxNzc3NCwwLjIyNzM3IC0wLjQzODIxNiwwLjIyMzI0IC0wLjcwMjc5OSwwLjU0NTcgLTAuMjYwNDQ5LDAuMzIyNDcgLTAuMjYwNDQ5LDAuNTgyOTEgMCwwLjE1NzEgMC4xMDMzNTMsMC4yNDgwNSAwLjEwMzM1MiwwLjA4NjggMC4yNjg3MTcsMC4wODY4IDAuMzgwMzM5LDAgMC43Mjc2MDQsLTAuMTgxOSAwLjM1MTQsLTAuMTg2MDQgMC41OTUzMTMsLTAuNDcxMjkgMC4yNDgwNDcsLTAuMjg5MzkgMC4zMTAwNTgsLTAuNTI5MTcgeiIgLz4KICA8L2c+CiAgPGcKICAgICBpZD0idGV4dDgyMSIKICAgICBzdHlsZT0iZm9udC1zdHlsZTppdGFsaWM7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6OC40NjY2NjYyMnB4O2xpbmUtaGVpZ2h0OjEuMjU7Zm9udC1mYW1pbHk6J1BhbGFjZSBTY3JpcHQgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1BhbGFjZSBTY3JpcHQgTVQsIEl0YWxpYyc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LWZlYXR1cmUtc2V0dGluZ3M6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7bGV0dGVyLXNwYWNpbmc6MHB4O3dvcmQtc3BhY2luZzowcHg7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4yNjQ1ODMzMiIKICAgICBhcmlhLWxhYmVsPSJUIgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuOTg0NDI2NDcsMCwwLDAuOTg0NDI2NDcsLTY1LjE5NjA3MSwtMTE5LjI1MDM0KSI+CiAgICA8cGF0aAogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIGlkPSJwYXRoNDUyMyIKICAgICAgIHN0eWxlPSJmb250LXN0eWxlOml0YWxpYztmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo4LjQ2NjY2NjIycHg7Zm9udC1mYW1pbHk6J1BhbGFjZSBTY3JpcHQgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1BhbGFjZSBTY3JpcHQgTVQsIEl0YWxpYyc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LWZlYXR1cmUtc2V0dGluZ3M6bm9ybWFsO3RleHQtYWxpZ246c3RhcnQ7d3JpdGluZy1tb2RlOmxyLXRiO3RleHQtYW5jaG9yOnN0YXJ0O3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIgogICAgICAgZD0ibSA3Mi45NDc4OCwxMjYuMTgwNzkgaCAwLjA1Nzg4IHEgLTAuMzM0ODYzLDAuNjc4IC0wLjc2MDY3NywxLjAxNyAtMC40MjU4MTQsMC4zMzg5OSAtMC43NDQxNDEsMC40MjU4MSAtMC4zMTQxOTIsMC4wODY4IC0wLjQ3NTQyMywwLjA4NjggLTAuMzE0MTkzLDAgLTAuNDk2MDk0LC0wLjE1Mjk3IC0wLjE4MTkwMSwtMC4xNTI5NiAtMC4xODE5MDEsLTAuNDEzNDEgMCwtMC4yMjMyNCAwLjE1Mjk2MywtMC41MDAyMyAwLjE1NzA5NiwtMC4yODExMiAwLjQ3OTU1NywtMC41Mzc0MyAwLjMyNjU5NSwtMC4yNjA0NSAwLjgzNTA5MSwtMC40MjU4MSAwLjUxMjYzLC0wLjE2OTUgMS4xOTg4OTMsLTAuMTY5NSAwLjQ3NTQyMywwIDEuMjQ0MzY5LDAuMDc0NCAwLjcwNjkzMywwLjA3MDMgMS4wNjY2MDEsMC4wNzAzIDAuMzUxNCwwIDAuNTg3MDQ0LC0wLjA0MTMgMC4yMzU2NDUsLTAuMDQxMyAwLjMzMDcyOSwtMC4xMTE2MiBoIDAuMDc0NDEgcSAtMC4xNjUzNjQsMC4xNDg4MyAtMC41NDk4MzcsMC4yMzk3OCAtMC4zODQ0NzIsMC4wOTA5IC0wLjY4NjI2MywwLjA5MDkgLTAuMTY1MzY0LDAgLTAuOTA1MzcxLC0wLjExMTYyIC0xLjA1ODMzMywtMC4xNTI5NyAtMS4zMzk0NTMsLTAuMTUyOTcgLTAuNTQ1NzAzLDAgLTEuMDA4NzI0LDAuMTUyOTcgLTAuNDYzMDIxLDAuMTQ4ODIgLTAuNzg1NDgxLDAuNDAxMDEgLTAuMzE4MzI3LDAuMjQ4MDQgLTAuNDgzNjkyLDAuNTIwODkgLTAuMTYxMjMsMC4yNjg3MiAtMC4xNjEyMywwLjUwODUgMCwwLjIzMTUxIDAuMTY1MzY0LDAuMzcyMDcgMC4xNjk0OTksMC4xMzY0MyAwLjQzODIxNiwwLjEzNjQzIDAuMjA2NzA2LDAgMC40NzU0MjQsLTAuMDk1MSAwLjI3Mjg1MSwtMC4wOTkyIDAuNTM3NDM0LC0wLjI4MTEyIDAuMjY4NzE4LC0wLjE4NjAzIDAuNTIwODk5LC0wLjQ3NTQyIDAuMjUyMTgxLC0wLjI4OTM5IDAuNDEzNDExLC0wLjYyODM5IHogbSAtMC43OTc4ODQsMS43Nzc2NyAwLjExMTYyMSwtMC4xNTI5NiBxIDEuMDIxMTI3LC0xLjQyNjI3IDIuMDkxODYyLC0xLjk0NzE3IGwgMC4wNDEzNCwwLjAzMzEgcSAtMC4zNzIwNywwLjE5NDMgLTAuNjY1NTkyLDAuNDE3NTQgLTAuMjg5Mzg4LDAuMjE5MTEgLTAuNTI1MDMzLDAuNTA0MzYgLTAuMjMxNTEsMC4yODExMiAtMC40MjU4MTMsMC42MjgzOSAtMC4zNTU1MzQsMC42MzY2NSAtMC41NDU3MDMsMC45MzQzMSAtMC4xOTAxNywwLjI5MzUyIC0wLjM5Mjc0MSwwLjUyMDkgLTAuMjgxMTIsMC4zMTAwNiAtMC42MjQyNTIsMC41NTgxIC0wLjMzODk5NywwLjI0ODA1IC0wLjY4NjI2MywwLjQwNTE1IC0wLjM0NzI2NSwwLjE1NzA5IC0wLjczMTczOCwwLjIzOTc3IC0wLjM4MDMzOCwwLjA4MjcgLTAuNzUyNDA5LDAuMDgyNyAtMC40OTE5NTksMCAtMC43MTkzMzYsLTAuMTQ0NyAtMC4yMjMyNDIsLTAuMTQ4ODMgLTAuMjIzMjQyLC0wLjM3MjA3IDAsLTAuMTQwNTYgMC4wNzg1NSwtMC4yMjczNyAwLjA3ODU1LC0wLjA5MDkgMC4xODYwMzYsLTAuMDkwOSAwLjE4NjAzNSwwIDAuMTg2MDM1LDAuMTYxMjMgMCwwLjA1MzcgLTAuMDQxMzQsMC4wOTkyIC0wLjAzNzIxLDAuMDQxMyAtMC4wOTUwOCwwLjA0MTMgLTAuMTk0MzAzLDAgLTAuMTI4MTU4LC0wLjIyNzM4IC0wLjA3MDI4LDAuMDQxMyAtMC4wOTkyMiwwLjA5NTEgLTAuMDI0ODEsMC4wNTM4IC0wLjAyNDgxLDAuMTQwNTYgMCwwLjE5ODQ0IDAuMjE5MTA4LDAuMzM0ODcgMC4yMjMyNDIsMC4xMzIyOSAwLjYyMDExNywwLjEzMjI5IDAuNTk5NDQ3LDAgMS4xMjg2MTMsLTAuMjAyNTcgMC41MjkxNjcsLTAuMjAyNTcgMC43OTc4ODQsLTAuNDY3MTYgMC4xNjEyMzEsLTAuMTUyOTYgMC4yOTc2NTcsLTAuMzAxNzkgMC4xMzY0MjUsLTAuMTUyOTYgMC4zNjM4MDIsLTAuNDQyMzUgMC4yMjczNzYsLTAuMjg5MzkgMC41NTgxMDUsLTAuNzUyNDEgeiIgLz4KICA8L2c+Cjwvc3ZnPgo=';


function sleep(time) {
    const d1 = new Date();
    while (true) {
        const d2 = new Date();
        if (d2 - d1 > time) {
            return;
        }
    }
}

/**
 * Class for the foo blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 */ 
class Scratch3Foo {

    /**
     * @return {array}
     */
    get CMD_MENU () {
        return [
            {
                text: 'ストップ !',
                value: ':auto_off'
            },
            {
                text: '前進',
                value: ':.forward'
            },
            {
                text: '後退(バック)',
                value: ':.backward'
            },
            {
                text: '右を向く',
                value: ':.turn_right'
            },
            {
                text: '左を向く',
                value: ':.turn_left'
            },
            {
                text: 'すり足',
                value: ':.suriashi_fwd'
            },
            {
                text: '右にスライド',
                value: ':.slide_right'
            },
            {
                text: '左にスライド',
                value: ':.slide_left'
            }
        ];
    }

    get MOTION_MENU () {
        return [
            {
                text: 'ストップ !',
                value: ':auto_off'
            },
            {
                text: 'ハッピー !',
                value: ':.happy'
            },
            {
                text: 'ハイ !',
                value: ':.hi'
            },
            {
                text: 'ビックリ !!',
                value: ':.surprised'
            },
            {
                text: 'おじぎ',
                value: ':.ojigi'
            },
            /*
            {
                text: 'おじぎ2',
                value: ':.ojigi2'
            }
            */
        ];
    }

    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.svr_addr = 'localhost';
        this.svr_port = 9001;
        this.timer_msec = 1500;

        // this._onTargetCreated = this._onTargetCreated.bind(this);
        // this.runtime.on('targetWasCreated', this._onTargetCreated);
    }


    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'foo',
            name: 'Foo Blocks',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'getURL',
                    text: 'URL',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'setURL1',
                    blockType: BlockType.COMMAND,
                    text: 'アドレス:[HOST]',
                    arguments: {
                        HOST: {
                            type: ArgumentType.STRING,
                            defaultValue: '192.168.0.228'
                        },
                    }
                },
                {
                    opcode: 'setURL2',
                    blockType: BlockType.COMMAND,
                    text: 'アドレス:[ADDR1].[ADDR2].[ADDR3].[ADDR4]',
                    arguments: {
                        ADDR1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 192
                        },
                        ADDR2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 168
                        },
                        ADDR3: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        ADDR4: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 228
                        },
                    }
                },
                /*
                {
                    opcode: 'addr192',
                    text: ' 192',
                    blockType: BlockType.REPORTER
                },
                */
                {
                    opcode: 'move',
                    blockType: BlockType.COMMAND,
                    text: '移動: [N]回 [CMD]',
                    arguments: {
                        N: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        CMD: {
                            type: ArgumentType.STRING,
                            menu: 'cmds',
                            defaultValue: ':auto_off'
                        }
                    }
                },
                {
                    opcode: 'motion',
                    blockType: BlockType.COMMAND,
                    text: 'モーション: [N]回 [CMD]',
                    arguments: {
                        N: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        CMD: {
                            type: ArgumentType.STRING,
                            menu: 'motions',
                            defaultValue: ':.surprised'
                        }
                    }
                },
                {
                    opcode: 'setURL0',
                    blockType: BlockType.COMMAND,
                    text: 'URL:[URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ws://192.168.0.228:9001/'
                        },
                    }
                },
                {
                    opcode: 'sendMsg',
                    blockType: BlockType.COMMAND,
                    text: 'WebSock: [URL] <== [MSG]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ws://192.168.0.228:9001/'
                        },
                        MSG: {
                            type: ArgumentType.STRING,
                            defaultValue: ':auto_off'
                        }
                    }
                },
                {
                    opcode: 'getBrowser',
                    text: 'user agent',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'calcPower',
                    blockType: BlockType.REPORTER,
                    text: 'べき乗:[NUM1] ** [NUM2]',
                    arguments: {
                        NUM1: {
                            type: ArgumentType.NUMBER
                        },
                        NUM2: {
                            type: ArgumentType.NUMBER
                        }
                    }
                }
            ],
            menus: {
                cmds: this.CMD_MENU,
                motions: this.MOTION_MENU,
            }
        };
    }

    _startStackTimer (util, duration_msec) {
        util.stackFrame.timer = new Timer();
        util.stackFrame.timer.start();
        util.stackFrame.duration = duration_msec;
        util.yield();
    }

    setURL0 (args) {
        this.url = Cast.toString(args.URL);
        log.log('url=' + this.url);
    }

    setURL1 (args) {
        this.svr_addr = Cast.toString(args.HOST);
        this.url = 'ws://' + this.svr_addr + ':' + this.svr_port + '/';
        log.log('url=' + this.url);
    }

    setURL2 (args) {
        const addr1 = Cast.toString(args.ADDR1);
        const addr2 = Cast.toString(args.ADDR2);
        const addr3 = Cast.toString(args.ADDR3);
        const addr4 = Cast.toString(args.ADDR4);
        this.svr_addr = addr1 + '.' + addr2 + '.' + addr3 + '.' + addr4;
        this.url = 'ws://' + this.svr_addr + ':' + this.svr_port + '/';
        log.log('url=' + this.url);
    }

    getURL (args) {
        let ret = this.url;
        if (this.url === undefined) {
            ret = '?';
        }
        
        return ret;
    }
    
    /*
    addr192 () {
        return 192;
    }
    */
    
    wsSend1(url, msg) {
        log.log('msg=' + msg);
        let ws = new WebSocket(url);

        ws.onopen = function (event) {
            log.log('ws.send(' + msg + ')');
            ws.send(msg);
            ws.close();
        };

        ws.onerror = function(event) {
            log.log('onerror(' + msg + '):' + String(event));
            return false;
        };
    }

    execCmd (args, util) {
        if (this.url === undefined) {
            log.log('URL: undefined');
            return false;
        }
        
        const cmd = Cast.toString(args.CMD) + ' ' + Cast.toString(args.N);

        if (!util.stackFrame.timer) {
            this.wsSend1(this.url, cmd);

            this._startStackTimer(util, this.timer_msec);
            util.yield();
        } else {
            const timeElapsed = util.stackFrame.timer.timeElapsed();
            if (timeElapsed < util.stackFrame.duration) {
                //this.runtime.requestRedraw();
                util.yield();
            } else {
                log.log('move(' + cmd + '):done');
            }
        }
        return undefined;
    }
    
    move (args, util) {
        this.execCmd(args, util);
    }

    motion (args, util) {
        this.execCmd(args, util);
    }
    
    sendMsg (args, util) {
        this.url = Cast.toString(args.URL);
        log.log('url=' + this.url);

        const msg = Cast.toString(args.MSG);
        log.log('msg=' + msg);

        this.wsSend1(this.url, msg);

        log.log('wsMsg(' + msg + '):done');
    }

    getBrowser () {
        return navigator.userAgent;
    }

    calcPower (args) {
        return args.NUM1 ** args.NUM2;
    }
}

module.exports = Scratch3Foo;
