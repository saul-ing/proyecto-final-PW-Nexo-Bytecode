"""Genera Excel sin dependencias externas. No atribuye aportes no confirmados."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
SHEETS = {
    "Actividades": [
        ["ID", "Actividad", "Responsable", "Estado", "Evidencia / dependencia"],
        ["A01", "Matriz del PDF y plan de pruebas", "Usuario: rol QA por acuerdo; nombre pendiente", "Preparado", "docs/qa; revisión del equipo pendiente"],
        ["A02", "Documentación técnica y manual", "Rol documentación; nombre pendiente", "Parcial", "Interfaz sin integrar; manual parcial"],
        ["A03", "Fixtures aislados", "Rol QA; nombre pendiente", "Preparado, carga pendiente", "12 elaborados, 2 reventas; sin DB validada"],
        ["A04", "Servidor y guía Windows", "Rol despliegue; nombre pendiente", "Preparado", "Prueba local; clon en otro equipo pendiente"],
        ["A05", "POS, compras, caja y RRHH", "Compañeros responsables: confirmar nombres", "Pendiente integración y QA", "No se afirma ausencia de trabajo"],
        ["A06", "Investigación IEEE", "Equipo: confirmar autores", "Borrador", "Formato IEEE, fuentes y resultados pendientes"],
    ],
    "Pruebas": [
        ["ID", "Prueba", "Estado", "Evidencia", "Responsable"],
        ["V01", "npm ci backend/frontend", "APROBADA con avisos", "qa/verificacion.md", "QA: nombre pendiente"],
        ["V02", "npm run qa:test", "APROBADA", "7 comprobaciones; sin DB", "QA: nombre pendiente"],
        ["V03", "Build frontend", "APROBADA con alcance limitado", "Solo App plantilla", "QA: nombre pendiente"],
        ["V04", "ESLint frontend", "FALLIDA", "2 errores react-hooks/set-state-in-effect", "Frontend: confirmar responsable"],
        ["V05", "Carga/repetición fixture en PostgreSQL", "NO EJECUTADA", "Requiere DB QA configurada", "QA: nombre pendiente"],
        ["V06", "Casos P0 de negocio", "BLOQUEADA", "Módulos no integrados", "Equipo"],
        ["V07", "Clon en otra computadora", "NO EJECUTADA", "Requiere equipo limpio", "Equipo"],
        ["V08", "Servidor local y proxy", "APROBADA", "200 estáticos/health,404 asset,502 API apagada", "QA: nombre pendiente"],
        ["V09", "Barreras fixture y esquema Prisma", "APROBADA", "Destino incorrecto/contraseña corta rechazados; esquema válido", "QA: nombre pendiente"],
    ],
    "Incidencias": [["ID", "Severidad", "Descripción", "Estado", "Responsable"]] + [
        ["QA-01", "Alta", "App plantilla sin navegación", "Abierta", "Frontend: confirmar"],
        ["QA-02", "Alta", "Reactstrap importado sin declarar", "Abierta", "Frontend/inventario: confirmar"],
        ["QA-03", "Alta, riesgo", "Validaciones numéricas incompletas", "Por confirmar con ejecución", "Inventario: confirmar"],
        ["QA-04", "Alta, riesgo", "Elaborado sin receta", "Por confirmar con venta integrada", "Inventario/ventas: confirmar"],
        ["QA-05", "Media", "Política por rol pendiente", "Por acordar", "Equipo"],
        ["QA-06", "Alta", "Flujos de dinero/nómina sin integrar", "Dependencia", "Equipo"],
        ["QA-07", "Media", "ESLint falla en dos componentes", "Confirmada por lint", "Inventario/frontend: confirmar"],
        ["QA-08", "Por evaluar", "npm audit reporta vulnerabilidades", "Revisión pendiente", "Equipo"],
    ],
}

def col(n):
    out = ""
    while n:
        n, r = divmod(n-1, 26)
        out = chr(65+r) + out
    return out

def sheet(rows):
    data = []
    for i, row in enumerate(rows, 1):
        cells = "".join(f'<c r="{col(j)}{i}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>' for j,value in enumerate(row,1))
        data.append(f'<row r="{i}">{cells}</row>')
    return '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="14" customWidth="1"/><col min="2" max="5" width="48" customWidth="1"/></cols><sheetData>'+"".join(data)+f'</sheetData><autoFilter ref="A1:E{len(rows)}"/></worksheet>'

if __name__ == "__main__":
    dest = ROOT / "docs/qa/seguimiento.xlsx"
    dest.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(dest,"w",ZIP_DEFLATED) as z:
        overrides = '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        overrides += "".join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1,len(SHEETS)+1))
        z.writestr("[Content_Types].xml",'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'+overrides+'</Types>')
        z.writestr("_rels/.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        entries = "".join(f'<sheet name="{name}" sheetId="{i}" r:id="rId{i}"/>' for i,name in enumerate(SHEETS,1))
        z.writestr("xl/workbook.xml",'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+entries+'</sheets></workbook>')
        rels = "".join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1,len(SHEETS)+1))
        z.writestr("xl/_rels/workbook.xml.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+rels+'</Relationships>')
        for i,rows in enumerate(SHEETS.values(),1):
            z.writestr(f"xl/worksheets/sheet{i}.xml",sheet(rows))
    print(dest)
