#!/usr/bin/env python3
"""Evidence-only checks on the pinned, official Mayan source tree.

No Mayan imports, services, network, or package installation. AST-extracted
methods run with explicitly simulated collaborators. This is NOT end-to-end
verification and does not establish real Django/SQL/Celery behavior.
"""
import argparse
import ast
import copy
import hashlib
import json
import operator
from functools import reduce
from pathlib import Path
import subprocess
from types import SimpleNamespace as NS


PIN = "834ffec1b539171390358e60a0406870108514f5"
BASE = "https://gitlab.com/mayan-edms/mayan-edms/-/blob/" + PIN + "/"
FILES = [
    "mayan/__init__.py", "LICENSE",
    "mayan/apps/documents/models/document_models.py",
    "mayan/apps/documents/models/document_file_models.py",
    "mayan/apps/documents/models/document_file_page_models.py",
    "mayan/apps/documents/models/document_file_model_mixins.py",
    "mayan/apps/documents/models/document_version_models.py",
    "mayan/apps/documents/models/document_version_page_models.py",
    "mayan/apps/documents/models/document_version_model_mixins.py",
    "mayan/apps/documents/document_file_actions.py",
    "mayan/apps/documents/api_views/document_api_views.py",
    "mayan/apps/documents/api_views/document_file_api_views.py",
    "mayan/apps/documents/api_views/api_view_mixins.py",
    "mayan/apps/documents/apps.py", "mayan/apps/documents/search.py",
    "mayan/apps/documents/storages.py",
    "mayan/apps/document_downloads/api_views.py",
    "mayan/apps/storage/api_views/base.py",
    "mayan/apps/storage/views/mixins.py",
    "mayan/apps/acls/models.py", "mayan/apps/acls/managers.py",
    "mayan/apps/acls/classes.py", "mayan/apps/permissions/model_mixins.py",
    "mayan/apps/permissions/models.py",
    "mayan/apps/rest_api/filters.py", "mayan/apps/rest_api/generics.py",
    "mayan/apps/rest_api/permissions.py", "mayan/apps/rest_api/api_view_mixins.py",
    "mayan/apps/views/view_mixins.py",
    "mayan/apps/metadata/models/metadata_type_models.py",
    "mayan/apps/metadata/models/metadata_instance_models.py",
    "mayan/apps/metadata/models/document_type_metadata_type_models.py",
    "mayan/apps/metadata/serializers.py", "mayan/apps/metadata/apps.py",
    "mayan/apps/metadata/api_views/document_api_views.py",
    "mayan/apps/document_states/models/workflow_models.py",
    "mayan/apps/document_states/models/workflow_model_mixins.py",
    "mayan/apps/document_states/models/workflow_state_models.py",
    "mayan/apps/document_states/models/workflow_state_model_mixins.py",
    "mayan/apps/document_states/models/workflow_instance_models.py",
    "mayan/apps/document_states/models/workflow_instance_model_mixins.py",
    "mayan/apps/document_states/models/workflow_transition_models.py",
    "mayan/apps/document_states/models/workflow_transition_model_mixins.py",
    "mayan/apps/document_states/models/workflow_transition_field_model_mixins.py",
    "mayan/apps/document_states/api_views/workflow_instance_api_views.py",
    "mayan/apps/document_states/serializers/workflow_instance_serializers.py",
    "mayan/apps/document_states/handlers.py", "mayan/apps/document_states/managers.py",
    "mayan/apps/document_states/apps.py", "mayan/apps/document_states/tasks.py",
    "mayan/apps/ocr/models.py", "mayan/apps/ocr/tasks.py",
    "mayan/apps/ocr/managers.py", "mayan/apps/ocr/api_views.py",
    "mayan/apps/ocr/search.py", "mayan/apps/ocr/backends/tesseract.py",
    "mayan/apps/dynamic_search/search_backends.py",
    "mayan/apps/dynamic_search/handlers.py", "mayan/apps/dynamic_search/tasks.py",
    "mayan/apps/dynamic_search/scoped_queries.py",
    "mayan/apps/events/classes.py", "mayan/apps/events/tasks.py",
    "mayan/apps/events/queues.py", "mayan/apps/task_manager/task_classes.py",
    "mayan/apps/task_manager/task_deduplication_backends.py",
    "mayan/apps/task_manager/classes.py",
    "mayan/apps/sources/api_views/source_action_api_views.py"
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    root = args.source.resolve()
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root,
                          check=True, capture_output=True, text=True).stdout.strip()
    assert head == PIN, "Wrong source revision; no target code will run"
    status = subprocess.run(["git", "status", "--porcelain", "--untracked-files=no"],
                            cwd=root, check=True, capture_output=True, text=True)
    assert not status.stdout.strip(), "Tracked source tree must be clean"
    evidence = {"revision": PIN, "remote": "https://gitlab.com/mayan-edms/mayan-edms.git",
                "version_scope": "master declares 4.12.2; no 4.12.2 remote tag observed",
                "kind": "static AST and isolated source methods with simulated collaborators",
                "not_tested": ["Django ORM", "HTTP API", "browser", "SQL concurrency",
                               "Celery", "Tesseract", "storage services"],
                "files": [], "checks": []}
    trees = {}
    for filename in FILES:
        data = (root / filename).read_bytes()
        item = {"path": filename, "sha256": hashlib.sha256(data).hexdigest(),
                "url": BASE + filename, "symbols": []}
        if filename.endswith(".py"):
            tree = ast.parse(data, filename=filename)
            trees[filename] = tree
            for node in tree.body:
                if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                    item["symbols"].append({"name": node.name, "start": node.lineno,
                                            "end": node.end_lineno})
                    if isinstance(node, ast.ClassDef):
                        for child in node.body:
                            if isinstance(child, ast.FunctionDef):
                                item["symbols"].append({"name": node.name + "." + child.name,
                                                        "start": child.lineno, "end": child.end_lineno})
        evidence["files"].append(item)

    def method(path, owner, name, context):
        cls = next(n for n in trees[path].body if isinstance(n, ast.ClassDef) and n.name == owner)
        node = copy.deepcopy(next(n for n in cls.body if isinstance(n, ast.FunctionDef) and n.name == name))
        node.decorator_list = []
        isolated = ast.Module(body=[node], type_ignores=[])
        namespace = dict(context)
        exec(compile(ast.fix_missing_locations(isolated), path, "exec"), namespace)
        return namespace[name]

    def record(name, source, outcome):
        assert outcome, name
        evidence["checks"].append({"name": name, "source": source, "passed": True,
                                   "scope": "isolated method; collaborators simulated"})

    class ValidationError(Exception):
        def __init__(self, message):
            super().__init__(message)

    meta_path = "mayan/apps/metadata/models/metadata_type_models.py"
    validate = method(meta_path, "MetadataType", "validate_value",
                      {"ValidationError": ValidationError, "_": lambda message: message})
    def metadata(**overrides):
        values = dict(default=None, lookup=None, validation=None, parser=None,
                      label="Importe", get_required_for=lambda **kw: False)
        values.update(overrides)
        return NS(**values)

    try:
        validate(metadata(get_required_for=lambda **kw: True), "Factura", "")
    except ValidationError:
        record("metadata_required_empty_rejected", meta_path, True)
    else:
        raise AssertionError("Required empty value accepted")
    record("metadata_default_before_required", meta_path,
           validate(metadata(default="template", get_default_value=lambda: "100",
                             get_required_for=lambda **kw: True), "Factura", "") == "100")
    try:
        validate(metadata(lookup="list", get_lookup_values=lambda: ["A", "B"]), "Factura", "C")
    except ValidationError:
        record("metadata_lookup_rejects_unlisted_value", meta_path, True)
    else:
        raise AssertionError("Unlisted value accepted")
    order = []
    candidate = metadata(validation="validator", parser="parser",
                         get_validator_instance=lambda: NS(validate=lambda value: order.append("validate:" + value)),
                         get_parser_instance=lambda: NS(parse=lambda value: order.append("parse:" + value) or value.upper()))
    parsed = validate(candidate, "Factura", "abc")
    record("metadata_validation_precedes_parser", meta_path,
           order == ["validate:abc", "parse:abc"] and parsed == "ABC")

    acl_path = "mayan/apps/acls/managers.py"
    class PermissionDenied(Exception):
        pass
    class Permission:
        @staticmethod
        def check_user_permission(permission, user):
            if not user.global_grant:
                raise PermissionDenied()
    restrict = method(acl_path, "AccessControlListManager", "restrict_queryset",
                      {"Permission": Permission, "PermissionDenied": PermissionDenied,
                       "reduce": reduce, "operator": operator})
    query = NS(none=lambda: "EMPTY", filter=lambda condition: ("FILTERED", condition))
    manager = NS(_get_acl_filters=lambda **kw: [1, 2])
    permission = NS(stored_permission="read")
    record("acl_anonymous_empty", acl_path,
           restrict(manager, permission, query, NS(is_authenticated=False)) == "EMPTY")
    record("acl_global_grant_preserves_queryset", acl_path,
           restrict(manager, permission, query, NS(is_authenticated=True, global_grant=True)) is query)
    record("acl_local_filters_combined_or", acl_path,
           restrict(manager, permission, query, NS(is_authenticated=True, global_grant=False)) == ("FILTERED", 3))

    append_path = "mayan/apps/documents/document_file_actions.py"
    results = []
    class FakeVersion:
        def __init__(self, **kwargs):
            self.kwargs = kwargs
        @staticmethod
        def annotate_content_object_list(content_object_list, start_page_number=1):
            return list(enumerate(content_object_list, start_page_number))
        def pages_remap(self, annotated_content_object_list, user):
            results.append(annotated_content_object_list)
    append = method(append_path, "DocumentFileActionAppendNewPages", "execute",
                    {"apps": NS(get_model=lambda **kw: FakeVersion)})
    file = NS(pages=NS(all=lambda: ["NEW1", "NEW2"]))
    append(NS(version_active=None), file, "test", None)
    record("append_without_active_version_starts_page_1", append_path,
           results[-1] == [(1, "NEW1"), (2, "NEW2")])
    version = NS(page_content_objects=["OLD1"], pages=NS(count=lambda: 1))
    append(NS(version_active=version), file, "test", None)
    record("append_keeps_old_pages_and_appends_new", append_path,
           results[-1] == [(1, "OLD1"), (2, "NEW1"), (3, "NEW2")])

    wf_path = "mayan/apps/document_states/models/workflow_instance_models.py"
    clean = method(wf_path, "WorkflowInstanceLogEntry", "clean",
                   {"ValidationError": ValidationError,
                    "_": lambda message: message,
                    "WorkflowTransitionField": NS(DoesNotExist=LookupError)})
    consulted = []
    log = NS(workflow_instance=NS(get_queryset_valid_transitions=lambda **kw: NS(
             filter=lambda **kw: NS(exists=lambda: True))), user=None,
             transition=NS(pk=1, fields=NS(get=lambda **kw: consulted.append(kw))),
             loads=lambda: {})
    clean(log)
    record("workflow_log_clean_empty_extra_data_does_not_visit_field_definitions", wf_path,
           not consulted)

    evidence["summary"] = {"files_hashed": len(FILES), "python_files_parsed": len(trees),
                           "isolated_checks_passed": len(evidence["checks"])}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(evidence["summary"]))


if __name__ == "__main__":
    main()
