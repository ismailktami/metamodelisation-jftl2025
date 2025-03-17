package com.example.utils;

import java.util.List;
import java.util.Map;

public class TestData {
    private String pageLink;
    private List<TestCase> testCases;

    public String getPageLink() {
        return pageLink;
    }

    public void setPageLink(String pageLink) {
        this.pageLink = pageLink;
    }

    public List<TestCase> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<TestCase> testCases) {
        this.testCases = testCases;
    }

    public static class TestCase {
        private String testCaseName;
        private Map<String, String> inputs;
        private List<Map<String, String>> expectations;

        public String getTestCaseName() {
            return testCaseName;
        }

        public void setTestCaseName(String testCaseName) {
            this.testCaseName = testCaseName;
        }

        public Map<String, String> getInputs() {
            return inputs;
        }

        public void setInputs(Map<String, String> inputs) {
            this.inputs = inputs;
        }

        public List<Map<String, String>> getExpectations() {
            return expectations;
        }

        public void setExpectations(List<Map<String, String>> expectations) {
            this.expectations = expectations;
        }
    }
}
