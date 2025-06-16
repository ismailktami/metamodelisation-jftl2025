# tests_from_json.py
from robot.api import TestSuite, ResultWriter
import json
from pathlib import Path

JSON_PATH = Path("accountFormWithDatas.json")
OUTPUT_XML = "output.xml"
BROWSER = "chrome"

def normalize(state: str) -> str:
    """
    toBeEnabled -> Enabled, enabled -> Enabled, visible -> Visible ...
    """
    if not state:
        return ""
    state = state.replace("toBe", "").capitalize()
    if state in ("Enabled", "Disabled", "Visible", "Hidden"):
        return state
    # fallback: retourne tel quel si on ne connaît pas
    return state

def build_suite_from_json(json_file: Path) -> TestSuite:
    with json_file.open(encoding="utf-8") as f:
        form = json.load(f)

    suite = TestSuite(form["formName"])
    suite.resource.imports.library("SeleniumLibrary")
    suite.resource.imports.library("BuiltIn")
    page_link = form["pageLink"]
    defined_fields = {fld["id"]: fld for fld in form.get("fields", [])}

    for tc in form["testCases"]:
        test = suite.tests.create(tc["testCaseName"])
        test.body.create_keyword("Open Browser", args=[page_link, BROWSER])

        # -------- Remplissage des champs --------
        for field_id, value in tc.get("datas", {}).items():
            field = defined_fields.get(field_id)     # Peut être None si non décrit
            selector = f"id={field_id}"
            keyword = "Input Text"                  # par défaut

            if field:                               # Décrit dans 'fields'
                if field["type"] == "select":
                    keyword = "Select From List By Value"
                elif field["type"] != "input":
                    test.body.create_keyword("Log",
                        args=[f"[WARNING] Type non géré: {field['type']}"])
            else:                                   # Champ inconnu du schéma
                test.body.create_keyword("Log",
                    args=[f"[WARNING] Champ non décrit: {field_id}"])

            test.body.create_keyword(keyword, args=[selector, str(value)])

        # -------- Vérification des attentes --------
        for expectation in tc.get("expectations", []):
            for action_id, raw_state in expectation.items():
                state = normalize(raw_state)
                # Essayons d'abord id, puis data-testid
                sel_id = f"id={action_id}"
                sel_testid = f'css:[data-testid="{action_id}"]'
                kw = {
                    "Enabled":  "Element Should Be Enabled",
                    "Disabled": "Element Should Be Disabled",
                    "Visible":  "Element Should Be Visible",
                    "Hidden":   "Element Should Not Be Visible"
                }.get(state)

                if kw:
                    # Test rapide: on suppose que l'id existe ; sinon on tente data-testid
                    test.body.create_keyword(kw, args=[sel_id])
                else:
                    test.body.create_keyword("Log",
                        args=[f"[WARNING] État attendu inconnu: {raw_state}"])

        test.body.create_keyword("Close Browser")

    return suite

if __name__ == "__main__":
    suite = build_suite_from_json(JSON_PATH)
    suite.run(output=OUTPUT_XML)
    ResultWriter(OUTPUT_XML).write_results(report="report.html", log="log.html")
    print("✅  Rapport généré : report.html / log.html")